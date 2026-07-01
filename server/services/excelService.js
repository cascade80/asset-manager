import ExcelJS from "exceljs";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
});

const reportTitleByType = {
    inventory: "Inventory Report",
    department: "Department-wise Report",
    purchase: "Purchase Report",
    warranty: "Warranty Report",
    utilization: "Asset Utilization Report",
    employee: "Employee Asset Report",
    audit: "Audit Log Export",
    monthly: "Monthly Summary Report"
};

const reportSubtitleByType = {
    inventory: "Current asset stock and assignment overview",
    department: "Department ownership, value, and assignment breakdown",
    purchase: "Purchases grouped by supplier and month",
    warranty: "Assets expiring within the next 30 days",
    utilization: "Assigned vs available asset utilization",
    employee: "Employee assignments and owned assets",
    audit: "Audit trail for compliance and review",
    monthly: "Month-to-date operational summary"
};

const formatCurrency = (value) => currencyFormatter.format(Number(value) || 0);

const formatDate = (value) => {
    if (!value) {
        return "N/A";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "N/A";
    }

    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
};

const safeDate = (value) => {
    if (!value) {
        return null;
    }

    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? null : date;
};

const isWithinRange = (date, start, end) => date && date >= start && date <= end;

const getMonthLabel = (date) =>
    date.toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric"
    });

const applyTitleRow = (worksheet, title, subtitle, columnCount) => {
    worksheet.addRow([title]);
    worksheet.mergeCells(1, 1, 1, columnCount);
    const titleCell = worksheet.getCell(1, 1);
    titleCell.font = { color: { argb: "FFFFFFFF" }, bold: true, size: 16 };
    titleCell.alignment = { vertical: "middle", horizontal: "left" };
    titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1D4ED8" } };

    worksheet.addRow([subtitle]);
    worksheet.mergeCells(2, 1, 2, columnCount);
    const subtitleCell = worksheet.getCell(2, 1);
    subtitleCell.font = { color: { argb: "FF1E293B" }, italic: true };
    subtitleCell.alignment = { vertical: "middle", horizontal: "left" };
    subtitleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEFF6FF" } };
};

const applyHeaderRow = (worksheet, headers, columnCount) => {
    const headerRow = worksheet.addRow(headers);
    headerRow.eachCell((cell) => {
        cell.font = { color: { argb: "FFFFFFFF" }, bold: true };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E40AF" } };
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.border = {
            top: { style: "thin", color: { argb: "FFD1D5DB" } },
            left: { style: "thin", color: { argb: "FFD1D5DB" } },
            bottom: { style: "thin", color: { argb: "FFD1D5DB" } },
            right: { style: "thin", color: { argb: "FFD1D5DB" } }
        };
    });

    worksheet.views = [{ state: "frozen", ySplit: 3 }];
    worksheet.autoFilter = {
        from: { row: 3, column: 1 },
        to: { row: 3, column: columnCount }
    };

    return headerRow.number;
};

const setAutoWidths = (worksheet, columnKeys, rows, minimumWidths = {}) => {
    columnKeys.forEach((key, index) => {
        const headerWidth = minimumWidths[key] || 12;
        let maxLength = headerWidth;

        rows.forEach((row) => {
            const value = row[key];
            const text = value === null || value === undefined ? "" : String(value);
            maxLength = Math.max(maxLength, text.length + 2);
        });

        worksheet.getColumn(index + 1).width = Math.min(Math.max(maxLength, headerWidth), 40);
    });
};

const createTableSheet = ({ workbook, name, title, subtitle, columns, rows, formatters = {}, rowStyler }) => {
    const worksheet = workbook.addWorksheet(name);
    worksheet.columns = columns.map((column) => ({ key: column.key, width: column.width || 15 }));

    applyTitleRow(worksheet, title, subtitle, columns.length);
    const headerRowNumber = applyHeaderRow(worksheet, columns.map((column) => column.header), columns.length);

    rows.forEach((rowData) => {
        const row = worksheet.addRow(rowData);

        columns.forEach((column, index) => {
            const cell = row.getCell(index + 1);

            if (formatters[column.key]) {
                formatters[column.key](cell, rowData);
            }

            cell.border = {
                top: { style: "thin", color: { argb: "FFE5E7EB" } },
                left: { style: "thin", color: { argb: "FFE5E7EB" } },
                bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
                right: { style: "thin", color: { argb: "FFE5E7EB" } }
            };
            cell.alignment = { vertical: "middle", wrapText: true };
        });

        if (rowStyler) {
            rowStyler(row, rowData);
        }
    });

    if (rows.length === 0) {
        const emptyRow = worksheet.addRow(["No data available", ...Array(columns.length - 1).fill("")]);
        emptyRow.eachCell((cell) => {
            cell.font = { italic: true, color: { argb: "FF64748B" } };
            cell.alignment = { vertical: "middle", horizontal: "left" };
        });
        worksheet.mergeCells(emptyRow.number, 1, emptyRow.number, columns.length);
    }

    setAutoWidths(
        worksheet,
        columns.map((column) => column.key),
        rows,
        Object.fromEntries(columns.map((column) => [column.key, column.width || 12]))
    );

    worksheet.getRow(headerRowNumber).height = 22;
    worksheet.pageSetup = { orientation: "landscape", fitToPage: true, fitToWidth: 1 };

    return worksheet;
};

const buildDepartmentRows = (assets, users) => {
    const usersByName = new Map(users.map((user) => [user.name, user]));
    const departments = Array.from(new Set(users.map((user) => user.department))).sort();

    return departments.map((department) => {
        const employees = users.filter((user) => user.department === department);
        const assignedAssets = assets.filter((asset) => {
            const owner = usersByName.get(asset.assignedTo);
            return owner?.department === department;
        });

        const totalValue = assignedAssets.reduce((sum, asset) => sum + (Number(asset.purchasePrice) || 0), 0);
        const topCategories = assignedAssets.reduce((accumulator, asset) => {
            const category = asset.category || "Uncategorized";
            accumulator[category] = (accumulator[category] || 0) + 1;
            return accumulator;
        }, {});

        const assetList = assignedAssets.slice(0, 4).map((asset) => asset.category || asset.name).join(", ");

        return {
            department,
            assets: assignedAssets.length,
            totalValue,
            employees: employees.length,
            assignedAssets: assetList || "N/A",
            topCategories: Object.entries(topCategories)
                .sort((a, b) => b[1] - a[1])
                .map(([category]) => category)
                .slice(0, 4)
                .join(", ") || "N/A"
        };
    });
};

const buildPurchaseRows = (assets) => {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date(startOfMonth);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    endOfMonth.setDate(0);
    endOfMonth.setHours(23, 59, 59, 999);

    const currentMonthAssets = assets.filter((asset) => isWithinRange(safeDate(asset.purchaseDate), startOfMonth, endOfMonth));
    const groupedBySupplier = currentMonthAssets.reduce((accumulator, asset) => {
        const supplier = asset.supplier || "Unknown Supplier";
        if (!accumulator[supplier]) {
            accumulator[supplier] = { supplier, cost: 0, items: 0, month: getMonthLabel(startOfMonth) };
        }
        accumulator[supplier].cost += Number(asset.purchasePrice) || 0;
        accumulator[supplier].items += 1;
        return accumulator;
    }, {});

    return Object.values(groupedBySupplier).sort((a, b) => b.cost - a.cost);
};

const buildWarrantyRows = (assets) => {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    return assets
        .map((asset) => {
            const expirationDate = safeDate(asset.expirationDate) || safeDate(asset.warrantyMonths);
            return {
                ...asset,
                expirationDate
            };
        })
        .filter((asset) => isWithinRange(asset.expirationDate, today, thirtyDaysFromNow))
        .sort((a, b) => a.expirationDate - b.expirationDate);
};

const buildEmployeeRows = (assets, users) => {
    return users.map((user) => {
        const assignedAssets = assets.filter((asset) => asset.assignedTo === user.name);
        return {
            employee: user.name,
            department: user.department,
            role: user.role,
            status: user.status,
            assetCount: assignedAssets.length,
            assets: assignedAssets.slice(0, 5).map((asset) => asset.name).join(", ") || "N/A"
        };
    });
};

const buildMonthlySummary = (assets, logs) => {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date(startOfMonth);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    endOfMonth.setDate(0);
    endOfMonth.setHours(23, 59, 59, 999);

    const createdThisMonth = assets.filter((asset) => isWithinRange(safeDate(asset.createdAt), startOfMonth, endOfMonth)).length;
    const deletedThisMonth = logs.filter((log) => log.action === "DELETE" && isWithinRange(safeDate(log.createdAt), startOfMonth, endOfMonth)).length;
    const maintenanceCount = assets.filter((asset) => asset.status === "Maintenance").length;
    const purchasesThisMonth = assets
        .filter((asset) => isWithinRange(safeDate(asset.purchaseDate), startOfMonth, endOfMonth))
        .reduce((sum, asset) => sum + (Number(asset.purchasePrice) || 0), 0);

    const categoryTotals = assets.reduce((accumulator, asset) => {
        if (!asset.assignedTo) {
            return accumulator;
        }

        const category = asset.category || "Uncategorized";
        accumulator[category] = (accumulator[category] || 0) + 1;
        return accumulator;
    }, {});

    const mostAssignedCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

    return {
        month: getMonthLabel(startOfMonth),
        assetsAdded: createdThisMonth,
        assetsDeleted: deletedThisMonth,
        repairs: maintenanceCount,
        purchases: purchasesThisMonth,
        mostAssignedCategory
    };
};

const getReportFilename = (reportType) => `asset_report_${reportType || "inventory"}.xlsx`;

export const generateReportWorkbook = async (res, { reportType = "inventory", assets = [], users = [], logs = [] } = {}) => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Asset Manager";
    workbook.created = new Date();
    workbook.modified = new Date();

    const usersByName = new Map(users.map((user) => [user.name, user]));
    const dashboardSummary = {
        totalAssets: assets.length,
        assignedAssets: assets.filter((asset) => asset.assignedTo).length,
        availableAssets: assets.filter((asset) => asset.status === "Available").length,
        maintenanceAssets: assets.filter((asset) => asset.status === "Maintenance").length,
        totalValue: assets.reduce((sum, asset) => sum + (Number(asset.purchasePrice) || 0), 0),
        departments: users.length,
        employees: users.length,
        utilization: assets.length ? Math.round((assets.filter((asset) => asset.assignedTo).length / assets.length) * 100) : 0
    };

    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    const warrantyRows = buildWarrantyRows(assets);
    const departmentRows = buildDepartmentRows(assets, users);
    const purchaseRows = buildPurchaseRows(assets);
    const employeeRows = buildEmployeeRows(assets, users);
    const monthlySummary = buildMonthlySummary(assets, logs);
    const auditRows = logs.map((log) => ({
        date: formatDate(log.createdAt),
        action: log.action,
        user: log.performedBy || "System Admin",
        asset: `${log.assetTag || ""} ${log.assetName || ""}`.trim(),
        details: log.details || ""
    }));

    createTableSheet({
        workbook,
        name: "Dashboard",
        title: "Asset Report Dashboard",
        subtitle: `Generated on ${formatDate(today)}`,
        columns: [
            { header: "Metric", key: "metric", width: 28 },
            { header: "Value", key: "value", width: 18 },
            { header: "Notes", key: "notes", width: 42 }
        ],
        rows: [
            { metric: "Total Assets", value: dashboardSummary.totalAssets, notes: "All assets in inventory" },
            { metric: "Assigned Assets", value: dashboardSummary.assignedAssets, notes: `${dashboardSummary.utilization}% utilization` },
            { metric: "Available Assets", value: dashboardSummary.availableAssets, notes: "Ready for assignment" },
            { metric: "Maintenance Assets", value: dashboardSummary.maintenanceAssets, notes: "Needs repair or review" },
            { metric: "Inventory Value", value: formatCurrency(dashboardSummary.totalValue), notes: "Based on purchase price" },
            { metric: "Departments", value: dashboardSummary.departments, notes: "Based on user directory" },
            { metric: "Employees", value: dashboardSummary.employees, notes: "Active employee records" },
            { metric: "Expiring Soon", value: warrantyRows.length, notes: "Within the next 30 days" }
        ],
        formatters: {
            value: (cell, rowData) => {
                if (rowData.metric === "Inventory Value") {
                    cell.value = rowData.value;
                } else {
                    cell.value = rowData.value;
                }
            }
        }
    });

    createTableSheet({
        workbook,
        name: "Inventory",
        title: reportTitleByType.inventory,
        subtitle: reportSubtitleByType.inventory,
        columns: [
            { header: "Asset Tag", key: "assetTag", width: 20 },
            { header: "Name", key: "name", width: 28 },
            { header: "Category", key: "category", width: 18 },
            { header: "Assigned To", key: "assignedTo", width: 24 },
            { header: "Status", key: "status", width: 18 },
            { header: "Location", key: "location", width: 18 },
            { header: "Purchase Price", key: "purchasePrice", width: 16 },
            { header: "Purchase Date", key: "purchaseDate", width: 16 },
            { header: "Warranty Until", key: "warrantyUntil", width: 16 }
        ],
        rows: assets.map((asset) => ({
            assetTag: asset.assetTag,
            name: asset.name,
            category: asset.category,
            assignedTo: asset.assignedTo || "Unassigned",
            status: asset.status,
            location: asset.location || "N/A",
            purchasePrice: formatCurrency(asset.purchasePrice),
            purchaseDate: formatDate(asset.purchaseDate),
            warrantyUntil: formatDate(asset.warrantyMonths || asset.expirationDate)
        })),
        formatters: {
            purchasePrice: (cell, rowData) => {
                cell.value = rowData.purchasePrice;
            }
        },
        rowStyler: (row, rowData) => {
            if (rowData.status === "Available") {
                row.eachCell((cell) => {
                    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE8F5E9" } };
                });
            }

            const warrantyDate = safeDate(rowData.warrantyUntil);
            if (warrantyDate && warrantyDate >= today && warrantyDate <= thirtyDaysFromNow) {
                row.getCell(9).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFC7CE" } };
                row.getCell(9).font = { color: { argb: "FF9C0006" }, bold: true };
            }
        }
    });

    createTableSheet({
        workbook,
        name: "Departments",
        title: reportTitleByType.department,
        subtitle: reportSubtitleByType.department,
        columns: [
            { header: "Department", key: "department", width: 18 },
            { header: "Assets", key: "assets", width: 12 },
            { header: "Total Value", key: "totalValue", width: 18 },
            { header: "Employees", key: "employees", width: 12 },
            { header: "Assets Assigned", key: "assignedAssets", width: 30 },
            { header: "Top Categories", key: "topCategories", width: 30 }
        ],
        rows: departmentRows.map((row) => ({
            ...row,
            totalValue: formatCurrency(row.totalValue)
        }))
    });

    createTableSheet({
        workbook,
        name: "Purchases",
        title: reportTitleByType.purchase,
        subtitle: `${reportSubtitleByType.purchase} - ${getMonthLabel(new Date())}`,
        columns: [
            { header: "Supplier", key: "supplier", width: 22 },
            { header: "Month", key: "month", width: 18 },
            { header: "Assets", key: "items", width: 12 },
            { header: "Cost", key: "cost", width: 18 }
        ],
        rows: purchaseRows.map((row) => ({
            ...row,
            cost: formatCurrency(row.cost)
        }))
    });

    createTableSheet({
        workbook,
        name: "Warranty",
        title: reportTitleByType.warranty,
        subtitle: reportSubtitleByType.warranty,
        columns: [
            { header: "Asset Tag", key: "assetTag", width: 20 },
            { header: "Name", key: "name", width: 26 },
            { header: "Category", key: "category", width: 18 },
            { header: "Expires", key: "expires", width: 16 },
            { header: "Assigned To", key: "assignedTo", width: 24 }
        ],
        rows: warrantyRows.map((asset) => ({
            assetTag: asset.assetTag,
            name: asset.name,
            category: asset.category,
            expires: formatDate(asset.expirationDate),
            assignedTo: asset.assignedTo || "Unassigned"
        })),
        rowStyler: (row, rowData) => {
            row.getCell(4).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFC7CE" } };
            row.getCell(4).font = { color: { argb: "FF9C0006" }, bold: true };
        }
    });

    createTableSheet({
        workbook,
        name: "Employees",
        title: reportTitleByType.employee,
        subtitle: reportSubtitleByType.employee,
        columns: [
            { header: "Employee", key: "employee", width: 24 },
            { header: "Department", key: "department", width: 18 },
            { header: "Role", key: "role", width: 14 },
            { header: "Status", key: "status", width: 14 },
            { header: "Asset Count", key: "assetCount", width: 14 },
            { header: "Assigned Assets", key: "assets", width: 34 }
        ],
        rows: employeeRows
    });

    createTableSheet({
        workbook,
        name: "Audit Logs",
        title: reportTitleByType.audit,
        subtitle: reportSubtitleByType.audit,
        columns: [
            { header: "Date", key: "date", width: 16 },
            { header: "Action", key: "action", width: 12 },
            { header: "User", key: "user", width: 20 },
            { header: "Asset", key: "asset", width: 28 },
            { header: "Details", key: "details", width: 42 }
        ],
        rows: auditRows,
        rowStyler: (row, rowData) => {
            if (rowData.action === "DELETE") {
                row.getCell(2).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFE4E6" } };
            }
        }
    });

    createTableSheet({
        workbook,
        name: "Monthly Summary",
        title: reportTitleByType.monthly,
        subtitle: `Month-to-date overview for ${monthlySummary.month}`,
        columns: [
            { header: "Metric", key: "metric", width: 28 },
            { header: "Value", key: "value", width: 18 },
            { header: "Comment", key: "comment", width: 36 }
        ],
        rows: [
            { metric: "Assets Added", value: monthlySummary.assetsAdded, comment: "Created this month" },
            { metric: "Assets Deleted", value: monthlySummary.assetsDeleted, comment: "Removed this month" },
            { metric: "Repairs", value: monthlySummary.repairs, comment: "Maintenance activity" },
            { metric: "Purchases", value: formatCurrency(monthlySummary.purchases), comment: "Current month spend" },
            { metric: "Most Assigned Category", value: monthlySummary.mostAssignedCategory, comment: "Most common assigned category" }
        ]
    });

    res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
        "Content-Disposition",
        `attachment; filename="${getReportFilename(reportType)}"`
    );

    await workbook.xlsx.write(res);
    res.end();
};

export const generateInventoryReport = async (res, assets = []) => {
    await generateReportWorkbook(res, { reportType: "inventory", assets });
};