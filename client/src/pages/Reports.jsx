import { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';

const reportOptions = [
	{ key: 'inventory', label: 'Inventory Report (.xlsx)' },
	{ key: 'department', label: 'Department-wise Report (.xlsx)' },
	{ key: 'purchase', label: 'Purchase Report (.xlsx)' },
	{ key: 'warranty', label: 'Warranty Report (.xlsx)' },
	{ key: 'utilization', label: 'Asset Utilization Report (.xlsx)' },
	{ key: 'employee', label: 'Employee Asset Report (.xlsx)' },
	{ key: 'audit', label: 'Audit Logs (.xlsx)' },
	{ key: 'monthly', label: 'Monthly Summary (.xlsx)' }
];

const formatCurrency = (value) =>
	new Intl.NumberFormat('en-IN', {
		style: 'currency',
		currency: 'INR',
		maximumFractionDigits: 0
	}).format(Number(value) || 0);

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
		year: 'numeric'
	});
};

const getDateOrNull = (value) => {
	if (!value) {
		return null;
	}

	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? null : date;
};

const getExpiryDate = (asset) => getDateOrNull(asset.expirationDate) || getDateOrNull(asset.warrantyMonths);

const Reports = () => {
	const [assets, setAssets] = useState([]);
	const [logs, setLogs] = useState([]);
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [selectedView, setSelectedView] = useState('inventory');
	const [employeeSearch, setEmployeeSearch] = useState('');
	const [exportMenuOpen, setExportMenuOpen] = useState(false);

	useEffect(() => {
		const fetchReportData = async () => {
			try {
				const [assetsRes, logsRes, usersRes] = await Promise.all([
					api.get('/assets'),
					api.get('/audit'),
					api.get('/users')
				]);

				setAssets(assetsRes.data);
				setLogs(logsRes.data);
				setUsers(usersRes.data);
			} catch (err) {
				console.error('Failed to load report data:', err);
				setError('Unable to load report data right now.');
			} finally {
				setLoading(false);
			}
		};

		fetchReportData();
	}, []);

	const summary = useMemo(() => {
		const totalAssets = assets.length;
		const assignedAssets = assets.filter((asset) => asset.assignedTo).length;
		const availableAssets = assets.filter((asset) => asset.status === 'Available').length;
		const maintenanceAssets = assets.filter((asset) => asset.status === 'Maintenance').length;
		const totalPurchaseValue = assets.reduce((sum, asset) => sum + (Number(asset.purchasePrice) || 0), 0);
		const utilization = totalAssets ? Math.round((assignedAssets / totalAssets) * 100) : 0;
		const today = new Date();
		const thirtyDaysFromNow = new Date();
		thirtyDaysFromNow.setDate(today.getDate() + 30);

		const warrantyAssets = assets
			.map((asset) => ({ ...asset, expiryDate: getExpiryDate(asset) }))
			.filter((asset) => asset.expiryDate && asset.expiryDate >= today && asset.expiryDate <= thirtyDaysFromNow)
			.sort((left, right) => left.expiryDate - right.expiryDate);

		const usersByName = new Map(users.map((user) => [user.name, user]));
		const departmentNames = Array.from(new Set(users.map((user) => user.department))).sort();
		const departmentRows = departmentNames.map((department) => {
			const departmentEmployees = users.filter((user) => user.department === department);
			const departmentAssets = assets.filter((asset) => {
				const owner = usersByName.get(asset.assignedTo);
				return owner?.department === department;
			});

			const topCategories = departmentAssets.reduce((accumulator, asset) => {
				const category = asset.category || 'Uncategorized';
				accumulator[category] = (accumulator[category] || 0) + 1;
				return accumulator;
			}, {});

			return {
				department,
				assets: departmentAssets.length,
				totalValue: departmentAssets.reduce((sum, asset) => sum + (Number(asset.purchasePrice) || 0), 0),
				employees: departmentEmployees.length,
				assetTypes: Object.entries(topCategories)
					.sort((a, b) => b[1] - a[1])
					.map(([category]) => category)
					.slice(0, 4)
					.join(', ') || 'N/A'
			};
		});

		const currentMonthStart = new Date();
		currentMonthStart.setDate(1);
		currentMonthStart.setHours(0, 0, 0, 0);
		const currentMonthEnd = new Date(currentMonthStart);
		currentMonthEnd.setMonth(currentMonthEnd.getMonth() + 1);
		currentMonthEnd.setDate(0);
		currentMonthEnd.setHours(23, 59, 59, 999);

		const purchaseRows = assets
			.filter((asset) => {
				const purchasedOn = getDateOrNull(asset.purchaseDate);
				return purchasedOn && purchasedOn >= currentMonthStart && purchasedOn <= currentMonthEnd;
			})
			.reduce((accumulator, asset) => {
				const supplier = asset.supplier || 'Unknown Supplier';
				if (!accumulator[supplier]) {
					accumulator[supplier] = { supplier, items: 0, cost: 0, month: currentMonthStart.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) };
				}
				accumulator[supplier].items += 1;
				accumulator[supplier].cost += Number(asset.purchasePrice) || 0;
				return accumulator;
			}, {});

		const employeeRows = users
			.filter((user) => user.name.toLowerCase().includes(employeeSearch.toLowerCase().trim()))
			.map((user) => {
				const assignedAssets = assets.filter((asset) => asset.assignedTo === user.name);
				return {
					...user,
					assetCount: assignedAssets.length,
					assetNames: assignedAssets.slice(0, 5).map((asset) => asset.name).join(', ') || 'N/A'
				};
			});

		const auditRows = logs.map((log) => ({
			date: formatDate(log.createdAt),
			action: log.action,
			user: log.performedBy || 'System Admin',
			asset: `${log.assetTag || ''} ${log.assetName || ''}`.trim(),
			details: log.details || ''
		}));

		const mostAssignedCategory = Object.entries(
			assets.reduce((accumulator, asset) => {
				if (!asset.assignedTo) {
					return accumulator;
				}

				const category = asset.category || 'Uncategorized';
				accumulator[category] = (accumulator[category] || 0) + 1;
				return accumulator;
			}, {})
		)
			.sort((left, right) => right[1] - left[1])[0]?.[0] || 'N/A';

		const assetsAdded = assets.filter((asset) => {
			const createdOn = getDateOrNull(asset.createdAt);
			return createdOn && createdOn >= currentMonthStart && createdOn <= currentMonthEnd;
		}).length;

		const assetsDeleted = logs.filter((log) => {
			const createdOn = getDateOrNull(log.createdAt);
			return log.action === 'DELETE' && createdOn && createdOn >= currentMonthStart && createdOn <= currentMonthEnd;
		}).length;

		const repairs = assets.filter((asset) => asset.status === 'Maintenance').length;
		const purchases = Object.values(purchaseRows).reduce((sum, row) => sum + row.cost, 0);

		return {
			totalAssets,
			assignedAssets,
			availableAssets,
			maintenanceAssets,
			totalPurchaseValue,
			utilization,
			warrantyAssets,
			departmentRows,
			purchaseRows: Object.values(purchaseRows).sort((left, right) => right.cost - left.cost),
			employeeRows,
			auditRows,
			assetsAdded,
			assetsDeleted,
			repairs,
			purchases,
			mostAssignedCategory
		};
	}, [assets, logs, users, employeeSearch]);

	const reportCards = [
		{ key: 'inventory', label: 'Inventory', value: summary.totalAssets, detail: `${summary.availableAssets} available` },
		{ key: 'department', label: 'Departments', value: summary.departmentRows.length, detail: 'Ownership by department' },
		{ key: 'purchase', label: 'Purchases', value: formatCurrency(summary.purchases), detail: 'Current month spend' },
		{ key: 'warranty', label: 'Expiring Soon', value: summary.warrantyAssets.length, detail: 'Next 30 days' },
		{ key: 'utilization', label: 'Utilization', value: `${summary.utilization}%`, detail: `${summary.assignedAssets} assigned` },
		{ key: 'employee', label: 'Employees', value: users.length, detail: 'Asset ownership view' },
		{ key: 'audit', label: 'Audit Logs', value: logs.length, detail: 'Compliance trail' },
		{ key: 'monthly', label: 'Monthly Summary', value: formatCurrency(summary.purchases), detail: `${summary.assetsAdded} added this month` }
	];

	const exportReport = async (reportType) => {
		try {
			const response = await api.get(`/reports/export/${reportType}`, {
				responseType: 'blob'
			});

			const url = window.URL.createObjectURL(new Blob([response.data]));
			const link = document.createElement('a');
			link.href = url;
			link.setAttribute('download', `asset_report_${reportType}.xlsx`);
			document.body.appendChild(link);
			link.click();
			link.remove();
			window.URL.revokeObjectURL(url);
		} catch (err) {
			console.error(err);
			setError('Unable to export the report right now.');
		}
	};

	if (loading) {
		return <div className="p-6 text-slate-500">Loading reports...</div>;
	}

	if (error) {
		return <div className="p-6 text-rose-600">{error}</div>;
	}

	const selectedCard = reportCards.find((card) => card.key === selectedView) || reportCards[0];

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
				<div>
					<p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500">Reports</p>
					<h2 className="text-3xl font-bold text-slate-900 mt-2">Reports & Insights</h2>
					<p className="text-sm text-slate-500 mt-1">Department, purchase, warranty, employee, audit, and monthly views in one place.</p>
				</div>

				<div className="relative self-start">
					<div className="flex gap-3">
						<button
							onClick={() => setSelectedView(selectedView === 'warranty' ? 'inventory' : 'warranty')}
							className="rounded-md border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100"
						>
							View Expiring Soon
						</button>
						<button
							onClick={() => setExportMenuOpen((current) => !current)}
							className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
						>
							Export xlsx ▾
						</button>
					</div>

					{exportMenuOpen && (
						<div className="absolute right-0 z-10 mt-2 w-72 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
							{reportOptions.map((option) => (
								<button
									key={option.key}
									type="button"
									onClick={() => {
										setExportMenuOpen(false);
										exportReport(option.key);
									}}
									className="block w-full border-b border-slate-100 px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50 last:border-b-0"
								>
									{option.label}
								</button>
							))}
						</div>
					)}
				</div>
			</div>

			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
				{reportCards.map((card) => {
					const isActive = selectedView === card.key;
					return (
						<button
							key={card.key}
							type="button"
							onClick={() => setSelectedView(card.key)}
							className={`rounded-xl border p-5 text-left shadow-sm transition ${
								isActive ? 'border-blue-400 bg-blue-50 shadow-md' : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
							}`}
						>
							<p className="text-xs font-bold uppercase tracking-wider text-slate-500">{card.label}</p>
							<h3 className="mt-2 text-3xl font-bold text-slate-900">{card.value}</h3>
							<p className="mt-1 text-sm text-slate-500">{card.detail}</p>
						</button>
					);
				})}
			</div>

			<div className="flex flex-wrap gap-2">
				{reportCards.map((card) => (
					<button
						key={card.key}
						type="button"
						onClick={() => setSelectedView(card.key)}
						className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
							selectedView === card.key ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
						}`}
					>
						{card.label}
					</button>
				))}
			</div>

			<div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
				<div className="border-b border-slate-200 px-6 py-4">
					<div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
						<div>
							<h3 className="text-lg font-semibold text-slate-900">{selectedCard.label}</h3>
							<p className="text-sm text-slate-500">{selectedCard.detail}</p>
						</div>
						<button
							type="button"
							onClick={() => exportReport(selectedView)}
							className="self-start rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
						>
							Export this view
						</button>
					</div>
				</div>

				<div className="p-6">
					{selectedView === 'inventory' && (
						<div className="space-y-6">
							<div className="grid grid-cols-1 gap-4 md:grid-cols-4">
								<div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase text-slate-500">Total Assets</p><p className="mt-2 text-3xl font-bold text-slate-900">{summary.totalAssets}</p></div>
								<div className="rounded-xl bg-emerald-50 p-4"><p className="text-xs font-bold uppercase text-emerald-700">Available</p><p className="mt-2 text-3xl font-bold text-emerald-900">{summary.availableAssets}</p></div>
								<div className="rounded-xl bg-blue-50 p-4"><p className="text-xs font-bold uppercase text-blue-700">Assigned</p><p className="mt-2 text-3xl font-bold text-blue-900">{summary.assignedAssets}</p></div>
								<div className="rounded-xl bg-rose-50 p-4"><p className="text-xs font-bold uppercase text-rose-700">Expiring Soon</p><p className="mt-2 text-3xl font-bold text-rose-900">{summary.warrantyAssets.length}</p></div>
							</div>

							<div className="overflow-hidden rounded-xl border border-slate-200">
								<table className="min-w-full divide-y divide-slate-200">
									<thead className="bg-slate-50">
										<tr>
											<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Asset Tag</th>
											<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Name</th>
											<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Category</th>
											<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Assigned To</th>
											<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
											<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Warranty</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-slate-200 bg-white">
										{assets.map((asset) => {
											const warrantyDate = getExpiryDate(asset);
											return (
												<tr key={asset._id} className={asset.status === 'Available' ? 'bg-emerald-50/50' : 'hover:bg-slate-50'}>
													<td className="px-4 py-3 text-sm font-medium text-slate-900">{asset.assetTag}</td>
													<td className="px-4 py-3 text-sm text-slate-700">{asset.name}</td>
													<td className="px-4 py-3 text-sm text-slate-700">{asset.category}</td>
													<td className="px-4 py-3 text-sm text-slate-700">{asset.assignedTo || 'Unassigned'}</td>
													<td className="px-4 py-3 text-sm text-slate-700">{asset.status}</td>
													<td className={`px-4 py-3 text-sm font-semibold ${warrantyDate && warrantyDate <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) ? 'text-rose-700' : 'text-slate-700'}`}>
														{formatDate(asset.warrantyMonths || asset.expirationDate)}
													</td>
												</tr>
											);
										})}
									</tbody>
								</table>
							</div>
						</div>
					)}

					{selectedView === 'department' && (
						<div className="space-y-4">
							<div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
								{summary.departmentRows.map((department) => (
									<div key={department.department} className="rounded-xl border border-slate-200 p-5">
										<div className="flex items-center justify-between gap-3">
											<div>
												<h4 className="text-lg font-semibold text-slate-900">{department.department}</h4>
												<p className="text-sm text-slate-500">Assets assigned to this department</p>
											</div>
											<span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{department.employees} employees</span>
										</div>
										<div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
											<div className="rounded-lg bg-slate-50 p-3"><p className="text-xs font-bold uppercase text-slate-500">Assets</p><p className="mt-1 text-2xl font-bold text-slate-900">{department.assets}</p></div>
											<div className="rounded-lg bg-slate-50 p-3"><p className="text-xs font-bold uppercase text-slate-500">Total Value</p><p className="mt-1 text-2xl font-bold text-slate-900">{formatCurrency(department.totalValue)}</p></div>
											<div className="rounded-lg bg-slate-50 p-3"><p className="text-xs font-bold uppercase text-slate-500">Assets Assigned</p><p className="mt-1 text-sm font-semibold text-slate-900">{department.assetTypes}</p></div>
										</div>
									</div>
								))}
							</div>
						</div>
					)}

					{selectedView === 'purchase' && (
						<div className="space-y-4">
							<div className="flex items-center justify-between rounded-xl bg-amber-50 p-4">
								<div>
									<p className="text-xs font-bold uppercase text-amber-700">Current Month Spend</p>
									<p className="text-2xl font-bold text-amber-900">{formatCurrency(summary.purchases)}</p>
								</div>
								<div className="text-right text-sm text-amber-800">
									<p>{summary.purchaseRows.length} suppliers</p>
									<p>{summary.assetsAdded} assets purchased this month</p>
								</div>
							</div>
							<div className="overflow-hidden rounded-xl border border-slate-200">
								<table className="min-w-full divide-y divide-slate-200">
									<thead className="bg-slate-50">
										<tr>
											<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Supplier</th>
											<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Month</th>
											<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Assets</th>
											<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Cost</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-slate-200 bg-white">
										{summary.purchaseRows.map((row) => (
											<tr key={row.supplier}>
												<td className="px-4 py-3 text-sm font-medium text-slate-900">{row.supplier}</td>
												<td className="px-4 py-3 text-sm text-slate-700">{row.month}</td>
												<td className="px-4 py-3 text-sm text-slate-700">{row.items}</td>
												<td className="px-4 py-3 text-sm font-semibold text-slate-900">{formatCurrency(row.cost)}</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					)}

					{selectedView === 'warranty' && (
						<div className="space-y-4">
							<div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
								<p className="text-xs font-bold uppercase text-rose-700">Expiring Within 30 Days</p>
								<p className="text-2xl font-bold text-rose-900">{summary.warrantyAssets.length} assets</p>
							</div>
							<div className="overflow-hidden rounded-xl border border-slate-200">
								<table className="min-w-full divide-y divide-slate-200">
									<thead className="bg-slate-50">
										<tr>
											<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Asset Tag</th>
											<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Name</th>
											<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Category</th>
											<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Expires</th>
											<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Assigned To</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-slate-200 bg-white">
										{summary.warrantyAssets.map((asset) => (
											<tr key={asset._id} className="hover:bg-slate-50">
												<td className="px-4 py-3 text-sm font-medium text-slate-900">{asset.assetTag}</td>
												<td className="px-4 py-3 text-sm text-slate-700">{asset.name}</td>
												<td className="px-4 py-3 text-sm text-slate-700">{asset.category}</td>
												<td className="px-4 py-3 text-sm font-semibold text-rose-700">{formatDate(asset.expiryDate)}</td>
												<td className="px-4 py-3 text-sm text-slate-700">{asset.assignedTo || 'Unassigned'}</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					)}

					{selectedView === 'utilization' && (
						<div className="space-y-6">
							<div className="grid grid-cols-1 gap-4 md:grid-cols-4">
								<div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase text-slate-500">Total Assets</p><p className="mt-2 text-3xl font-bold text-slate-900">{summary.totalAssets}</p></div>
								<div className="rounded-xl bg-blue-50 p-4"><p className="text-xs font-bold uppercase text-blue-700">Assigned</p><p className="mt-2 text-3xl font-bold text-blue-900">{summary.assignedAssets}</p></div>
								<div className="rounded-xl bg-emerald-50 p-4"><p className="text-xs font-bold uppercase text-emerald-700">Available</p><p className="mt-2 text-3xl font-bold text-emerald-900">{summary.availableAssets}</p></div>
								<div className="rounded-xl bg-amber-50 p-4"><p className="text-xs font-bold uppercase text-amber-700">Maintenance</p><p className="mt-2 text-3xl font-bold text-amber-900">{summary.maintenanceAssets}</p></div>
							</div>
							<div className="rounded-xl border border-slate-200 p-5">
								<div className="flex items-end justify-between">
									<div>
										<p className="text-xs font-bold uppercase tracking-wider text-slate-500">Utilization</p>
										<p className="mt-2 text-5xl font-bold text-slate-900">{summary.utilization}%</p>
									</div>
									<p className="text-sm text-slate-500">Assigned assets divided by total assets</p>
								</div>
								<div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
									<div className="h-full rounded-full bg-blue-600" style={{ width: `${summary.utilization}%` }} />
								</div>
							</div>
						</div>
					)}

					{selectedView === 'employee' && (
						<div className="space-y-4">
							<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
								<div>
									<h4 className="text-lg font-semibold text-slate-900">Employee Asset Report</h4>
									<p className="text-sm text-slate-500">Search for an employee to see assigned hardware and software.</p>
								</div>
								<input
									type="text"
									value={employeeSearch}
									onChange={(event) => setEmployeeSearch(event.target.value)}
									placeholder="Search employee name"
									className="w-full rounded-md border border-slate-300 px-4 py-2 text-sm outline-none focus:border-blue-500 md:max-w-xs"
								/>
							</div>
							<div className="overflow-hidden rounded-xl border border-slate-200">
								<table className="min-w-full divide-y divide-slate-200">
									<thead className="bg-slate-50">
										<tr>
											<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Employee</th>
											<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Department</th>
											<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Role</th>
											<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Assets</th>
											<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Assigned Assets</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-slate-200 bg-white">
										{summary.employeeRows.map((employee) => (
											<tr key={employee.email || employee.name}>
												<td className="px-4 py-3 text-sm font-medium text-slate-900">{employee.name}</td>
												<td className="px-4 py-3 text-sm text-slate-700">{employee.department}</td>
												<td className="px-4 py-3 text-sm text-slate-700">{employee.role}</td>
												<td className="px-4 py-3 text-sm text-slate-700">{employee.assetCount}</td>
												<td className="px-4 py-3 text-sm text-slate-700">{employee.assetNames}</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					)}

					{selectedView === 'audit' && (
						<div className="overflow-hidden rounded-xl border border-slate-200">
							<table className="min-w-full divide-y divide-slate-200">
								<thead className="bg-slate-50">
									<tr>
										<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Date</th>
										<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Action</th>
										<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">User</th>
										<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Asset</th>
										<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Details</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-slate-200 bg-white">
									{summary.auditRows.map((log, index) => (
										<tr key={`${log.date}-${index}`} className="hover:bg-slate-50">
											<td className="px-4 py-3 text-sm text-slate-700">{log.date}</td>
											<td className="px-4 py-3 text-sm font-semibold text-slate-900">{log.action}</td>
											<td className="px-4 py-3 text-sm text-slate-700">{log.user}</td>
											<td className="px-4 py-3 text-sm text-slate-700">{log.asset}</td>
											<td className="px-4 py-3 text-sm text-slate-700">{log.details}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}

					{selectedView === 'monthly' && (
						<div className="space-y-6">
							<div className="grid grid-cols-1 gap-4 md:grid-cols-5">
								<div className="rounded-xl bg-emerald-50 p-4"><p className="text-xs font-bold uppercase text-emerald-700">Assets Added</p><p className="mt-2 text-3xl font-bold text-emerald-900">{summary.assetsAdded}</p></div>
								<div className="rounded-xl bg-rose-50 p-4"><p className="text-xs font-bold uppercase text-rose-700">Assets Deleted</p><p className="mt-2 text-3xl font-bold text-rose-900">{summary.assetsDeleted}</p></div>
								<div className="rounded-xl bg-amber-50 p-4"><p className="text-xs font-bold uppercase text-amber-700">Repairs</p><p className="mt-2 text-3xl font-bold text-amber-900">{summary.repairs}</p></div>
								<div className="rounded-xl bg-blue-50 p-4"><p className="text-xs font-bold uppercase text-blue-700">Purchases</p><p className="mt-2 text-2xl font-bold text-blue-900">{formatCurrency(summary.purchases)}</p></div>
								<div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase text-slate-500">Most Assigned Category</p><p className="mt-2 text-xl font-bold text-slate-900">{summary.mostAssignedCategory}</p></div>
							</div>
							<div className="rounded-xl border border-slate-200 p-5">
								<h4 className="text-lg font-semibold text-slate-900">Month-to-date summary</h4>
								<p className="mt-1 text-sm text-slate-500">This view is designed for leadership and operations reviews.</p>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default Reports;
