import { useMemo } from 'react';
import { Skeleton, Empty, Alert } from 'antd';
import { useCRMDataset } from '../CRMReports/hooks/useCRMDataset';
import { useCRMFilters } from '../CRMReports/hooks/useCRMFilters';
import { useCRMAnalytics } from '../CRMReports/hooks/useCRMAnalytics';

import DashboardHeader from './components/DashboardHeader';
import GlobalDateFilter from './components/GlobalDateFilter';
import AdvancedFilters from './components/AdvancedFilters';
import ActiveFilterTags from './components/ActiveFilterTags';
import KPISection from './components/KPISection';
import SalesTrendChart from './components/SalesTrendChart';
import { LeadCrmPerformance, ManagerCrmPerformance } from './components/CRMPerformanceChart';
import { RegionAnalytics, StateAnalytics } from './components/RegionAnalytics';
import CategoryAnalytics from './components/CategoryAnalytics';
import ProductAnalytics from './components/ProductAnalytics';
import TyreTypeAnalytics from './components/TyreTypeAnalytics';
import MonthlyTyreSizeChart from './components/MonthlyTyreSizeChart';
import CustomerAnalytics from './components/CustomerAnalytics';
import DispatchAnalytics from './components/DispatchAnalytics';
import FreightAnalytics from './components/FreightAnalytics';
import SalesDataTable from './components/SalesDataTable';

export default function CRMReports() {
  const { dataset, loading, error } = useCRMDataset();
  const {
    filters,
    setFilter,
    applyPointFilter,
    removeFilterValue,
    resetFilters,
    filteredData,
    activeFilterChips,
    filterOptions,
  } = useCRMFilters(dataset);
  const analytics = useCRMAnalytics(filteredData);

  const isEmpty = !loading && !error && filteredData.length === 0;

  const gridSectionClass = 'grid grid-cols-1 lg:grid-cols-2 gap-4';

  return (
    <div
      className="min-h-screen bg-[var(--background)] text-[var(--foreground)]"
      style={{ fontFamily: 'var(--font-primary)' }}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 flex flex-col gap-4">
        <DashboardHeader />

        <div className="flex flex-col xl:flex-row gap-4">
          <div className="xl:w-[340px] shrink-0">
            <GlobalDateFilter
              dateType={filters.dateType}
              dateRange={filters.dateRange}
              onDateTypeChange={(v) => setFilter('dateType', v)}
              onDateRangeChange={(range) => setFilter('dateRange', range)}
            />
          </div>
          <div className="flex-1 flex flex-col gap-3 min-w-0">
            <AdvancedFilters
              filters={filters}
              filterOptions={filterOptions}
              setFilter={setFilter}
              resetFilters={resetFilters}
              filteredCount={filteredData.length}
              totalCount={dataset.length}
            />
            <ActiveFilterTags chips={activeFilterChips} onRemove={removeFilterValue} />
          </div>
        </div>

        {loading && (
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-[calc(var(--radius)*2)] p-6">
            <Skeleton active paragraph={{ rows: 6 }} />
          </div>
        )}

        {error && <Alert type="error" showIcon message="Could not load sales data" description={error} />}

        {isEmpty && (
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-[calc(var(--radius)*2)] p-12 flex items-center justify-center">
            <Empty description="No records match the current filters. Try widening your date range or clearing a few filters." />
          </div>
        )}

        {!loading && !error && !isEmpty && (
          <>
            <KPISection kpis={analytics.kpis} />

            <SalesTrendChart filteredData={filteredData} dateType={filters.dateType} />

            <div className={gridSectionClass}>
              <LeadCrmPerformance data={analytics.leadCrmPerformance} onSelect={applyPointFilter} />
              <ManagerCrmPerformance data={analytics.managerCrmPerformance} onSelect={applyPointFilter} />
            </div>

            <div className={gridSectionClass}>
              <RegionAnalytics data={analytics.regionPerformance} onSelect={applyPointFilter} />
              <StateAnalytics data={analytics.statePerformance} onSelect={applyPointFilter} />
            </div>

            <div className={gridSectionClass}>
              <CategoryAnalytics data={analytics.categoryPerformance} onSelect={applyPointFilter} />
              <ProductAnalytics
                tyreSizeData={analytics.tyreSizePerformance}
                platformData={analytics.platformPerformance}
                rimTypeData={analytics.rimTypePerformance}
                onSelect={applyPointFilter}
              />
            </div>

            <TyreTypeAnalytics
              data={analytics.tyreTypePerformance}
              filteredData={filteredData}
              onSelect={applyPointFilter}
            />

            {/* <MonthlyTyreSizeChart dataset={dataset} /> */}
            <MonthlyTyreSizeChart dataset={filteredData} />

            <div className={gridSectionClass}>
              <CustomerAnalytics data={analytics.customerPerformance} onSelect={applyPointFilter} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <DispatchAnalytics
                dispatchBuckets={analytics.dispatchBuckets}
                validDispatchRecords={analytics.validDispatchRecords}
              />
              <FreightAnalytics data={analytics.freightPerformance} onSelect={applyPointFilter} />
            </div>

            <SalesDataTable filteredData={filteredData} filterOptions={filterOptions} />
          </>
        )}
      </div>
    </div>
  );
}
