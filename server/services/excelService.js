import ExcelJS from 'exceljs';

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const titleByReportType = {
  inventory: 'Inventory Report',
  department: 'Department Report',
  purchase: 'Purchase Report',
  warranty: 'Warranty Report',
  utilization: 'Asset Utilization Report',
  employee: 'Employee Asset Report',
  audit: 'Audit Log Report',
  monthly: 'Monthly Summary Report',
};

const sheetNameByReportType = {
  inventory: 'Inventory',
  department: 'Departments',
  purchase: 'Purchases',
  warranty: 'Warranty',
  utilization: 'Utilization',
  employee: 'Employees',
  audit: 'Audit Logs',
  monthly: 'Monthly Summary',
};

const formatCurrency = (value) => currencyFormatter.format(Number(value) || 0);

const formatDate = (value) => {
  if (!value) {
    return 'N/A';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'N/A';
  }

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
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
  date.toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  });

const createWorksheet = ({ workbook, sheetName, title, columns, rows }) => {
  const worksheet = workbook.addWorksheet(sheetName);
  worksheet.columns = columns.map((column) => ({
    key: column.key,
    width: column.width || 18,
  }));

  worksheet.addRow([title]);
  if (columns.length > 1) {
    worksheet.mergeCells(1, 1, 1, columns.length);
  }

  worksheet.addRow(columns.map((column) => column.header));

  worksheet.getRow(1).font = { bold: true, size: 14 };
  worksheet.getRow(1).alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(2).font = { bold: true };

  rows.forEach((rowData) => {
    worksheet.addRow(columns.map((column) => rowData[column.key] ?? ''));
  });

  if (rows.length === 0) {
    worksheet.addRow(['No data available']);
  }

  worksheet.views = [{ state: 'frozen', ySplit: 2 }];
  worksheet.autoFilter = {
    from: { row: 2, column: 1 },
    to: { row: 2, column: columns.length },
  };

  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell) => {
      cell.alignment = { vertical: 'middle', wrapText: true };

      if (rowNumber === 2) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
          left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
          bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
          right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        };
      }
    });
  });

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
      const category = asset.category || 'Uncategorized';
      accumulator[category] = (accumulator[category] || 0) + 1;
      return accumulator;
    }, {});

    return {
      department,
      assets: assignedAssets.length,
      totalValue: formatCurrency(totalValue),
      employees: employees.length,
      assignedAssets: assignedAssets.slice(0, 4).map((asset) => asset.category || asset.name).join(', ') || 'N/A',
      topCategories: Object.entries(topCategories)
        .sort((a, b) => b[1] - a[1])
        .map(([category]) => category)
        .slice(0, 4)
        .join(', ') || 'N/A',
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
    const supplier = asset.supplier || 'Unknown Supplier';
    if (!accumulator[supplier]) {
      accumulator[supplier] = { supplier, cost: 0, items: 0, month: getMonthLabel(startOfMonth) };
    }
    accumulator[supplier].cost += Number(asset.purchasePrice) || 0;
    accumulator[supplier].items += 1;
    return accumulator;
  }, {});

  return Object.values(groupedBySupplier)
    .sort((a, b) => b.cost - a.cost)
    .map((row) => ({
      ...row,
      cost: formatCurrency(row.cost),
    }));
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
        expirationDate,
      };
    })
    .filter((asset) => isWithinRange(asset.expirationDate, today, thirtyDaysFromNow))
    .sort((a, b) => a.expirationDate - b.expirationDate)
    .map((asset) => ({
      assetTag: asset.assetTag,
      name: asset.name,
      category: asset.category,
      expires: formatDate(asset.expirationDate),
      assignedTo: asset.assignedTo || 'Unassigned',
    }));
};

const buildEmployeeRows = (assets, users) =>
  users.map((user) => {
    const assignedAssets = assets.filter((asset) => asset.assignedTo === user.name);
    return {
      employee: user.name,
      department: user.department,
      role: user.role,
      status: user.status,
      assetCount: assignedAssets.length,
      assets: assignedAssets.slice(0, 5).map((asset) => asset.name).join(', ') || 'N/A',
    };
  });

const buildMonthlySummaryRows = (assets, logs) => {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const endOfMonth = new Date(startOfMonth);
  endOfMonth.setMonth(endOfMonth.getMonth() + 1);
  endOfMonth.setDate(0);
  endOfMonth.setHours(23, 59, 59, 999);

  const createdThisMonth = assets.filter((asset) => isWithinRange(safeDate(asset.createdAt), startOfMonth, endOfMonth)).length;
  const deletedThisMonth = logs.filter((log) => log.action === 'DELETE' && isWithinRange(safeDate(log.createdAt), startOfMonth, endOfMonth)).length;
  const maintenanceCount = assets.filter((asset) => asset.status === 'Maintenance').length;
  const purchasesThisMonth = assets
    .filter((asset) => isWithinRange(safeDate(asset.purchaseDate), startOfMonth, endOfMonth))
    .reduce((sum, asset) => sum + (Number(asset.purchasePrice) || 0), 0);

  const categoryTotals = assets.reduce((accumulator, asset) => {
    if (!asset.assignedTo) {
      return accumulator;
    }

    const category = asset.category || 'Uncategorized';
    accumulator[category] = (accumulator[category] || 0) + 1;
    return accumulator;
  }, {});

  const mostAssignedCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  return [
    { metric: 'Month', value: getMonthLabel(startOfMonth), note: 'Report period' },
    { metric: 'Assets Added', value: createdThisMonth, note: 'Created this month' },
    { metric: 'Assets Deleted', value: deletedThisMonth, note: 'Removed this month' },
    { metric: 'Repairs', value: maintenanceCount, note: 'Maintenance activity' },
    { metric: 'Purchases', value: formatCurrency(purchasesThisMonth), note: 'Current month spend' },
    { metric: 'Most Assigned Category', value: mostAssignedCategory, note: 'Most common assigned category' },
  ];
};

const getReportFilename = (reportType) => `asset_report_${reportType || 'inventory'}.xlsx`;

export const generateReportWorkbook = async (res, { reportType = 'inventory', assets = [], users = [], logs = [] } = {}) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Asset Manager';
  workbook.created = new Date();
  workbook.modified = new Date();

  const sheetName = sheetNameByReportType[reportType] || 'Report';
  const title = titleByReportType[reportType] || 'Report';

  const rowsByType = {
    inventory: assets.map((asset) => ({
      assetTag: asset.assetTag,
      name: asset.name,
      category: asset.category,
      assignedTo: asset.assignedTo || 'Unassigned',
      status: asset.status,
      location: asset.location || 'N/A',
      purchasePrice: formatCurrency(asset.purchasePrice),
      purchaseDate: formatDate(asset.purchaseDate),
      warrantyUntil: formatDate(asset.warrantyMonths || asset.expirationDate),
    })),
    department: buildDepartmentRows(assets, users),
    purchase: buildPurchaseRows(assets),
    warranty: buildWarrantyRows(assets),
    utilization: [
      { metric: 'Total Assets', value: assets.length, note: 'All inventory records' },
      { metric: 'Assigned Assets', value: assets.filter((asset) => asset.assignedTo).length, note: 'Currently assigned' },
      { metric: 'Available Assets', value: assets.filter((asset) => asset.status === 'Available').length, note: 'Ready for assignment' },
      { metric: 'Maintenance Assets', value: assets.filter((asset) => asset.status === 'Maintenance').length, note: 'Needs attention' },
      { metric: 'Utilization', value: `${assets.length ? Math.round((assets.filter((asset) => asset.assignedTo).length / assets.length) * 100) : 0}%`, note: 'Assigned / total' },
    ],
    employee: buildEmployeeRows(assets, users),
    audit: logs.map((log) => ({
      date: formatDate(log.createdAt),
      action: log.action,
      user: log.performedBy || 'System Admin',
      asset: `${log.assetTag || ''} ${log.assetName || ''}`.trim(),
      details: log.details || '',
    })),
    monthly: buildMonthlySummaryRows(assets, logs),
  };

  const columnsByType = {
    inventory: [
      { header: 'Asset Tag', key: 'assetTag', width: 18 },
      { header: 'Name', key: 'name', width: 26 },
      { header: 'Category', key: 'category', width: 18 },
      { header: 'Assigned To', key: 'assignedTo', width: 22 },
      { header: 'Status', key: 'status', width: 16 },
      { header: 'Location', key: 'location', width: 18 },
      { header: 'Purchase Price', key: 'purchasePrice', width: 16 },
      { header: 'Purchase Date', key: 'purchaseDate', width: 16 },
      { header: 'Warranty Until', key: 'warrantyUntil', width: 16 },
    ],
    department: [
      { header: 'Department', key: 'department', width: 18 },
      { header: 'Assets', key: 'assets', width: 12 },
      { header: 'Total Value', key: 'totalValue', width: 18 },
      { header: 'Employees', key: 'employees', width: 12 },
      { header: 'Assigned Assets', key: 'assignedAssets', width: 30 },
      { header: 'Top Categories', key: 'topCategories', width: 30 },
    ],
    purchase: [
      { header: 'Supplier', key: 'supplier', width: 24 },
      { header: 'Month', key: 'month', width: 18 },
      { header: 'Assets', key: 'items', width: 12 },
      { header: 'Cost', key: 'cost', width: 18 },
    ],
    warranty: [
      { header: 'Asset Tag', key: 'assetTag', width: 18 },
      { header: 'Name', key: 'name', width: 26 },
      { header: 'Category', key: 'category', width: 18 },
      { header: 'Expires', key: 'expires', width: 16 },
      { header: 'Assigned To', key: 'assignedTo', width: 22 },
    ],
    utilization: [
      { header: 'Metric', key: 'metric', width: 24 },
      { header: 'Value', key: 'value', width: 18 },
      { header: 'Note', key: 'note', width: 30 },
    ],
    employee: [
      { header: 'Employee', key: 'employee', width: 24 },
      { header: 'Department', key: 'department', width: 18 },
      { header: 'Role', key: 'role', width: 14 },
      { header: 'Status', key: 'status', width: 14 },
      { header: 'Asset Count', key: 'assetCount', width: 14 },
      { header: 'Assigned Assets', key: 'assets', width: 34 },
    ],
    audit: [
      { header: 'Date', key: 'date', width: 16 },
      { header: 'Action', key: 'action', width: 12 },
      { header: 'User', key: 'user', width: 20 },
      { header: 'Asset', key: 'asset', width: 28 },
      { header: 'Details', key: 'details', width: 40 },
    ],
    monthly: [
      { header: 'Metric', key: 'metric', width: 24 },
      { header: 'Value', key: 'value', width: 18 },
      { header: 'Note', key: 'note', width: 30 },
    ],
  };

  createWorksheet({
    workbook,
    sheetName,
    title,
    columns: columnsByType[reportType] || columnsByType.inventory,
    rows: rowsByType[reportType] || rowsByType.inventory,
  });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${getReportFilename(reportType)}"`);

  await workbook.xlsx.write(res);
  res.end();
};

export const generateInventoryReport = async (res, assets = []) => {
  await generateReportWorkbook(res, { reportType: 'inventory', assets });
};