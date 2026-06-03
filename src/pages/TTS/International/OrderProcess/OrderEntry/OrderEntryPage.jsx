import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, AlertCircle } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════

export default function SalesOrderForm() {
  const [expandedSections, setExpandedSections] = useState({
    entity: false,
    orderType: false,
    customer: false,
    address: false,
    additional: false,
  });

  const [selectedEntity, setSelectedEntity] = useState('Global HQ');
  const [selectedOrderType, setSelectedOrderType] = useState('Standard Sales Order');
  const [selectedCustomer, setSelectedCustomer] = useState({
    name: 'Acme Corporation',
    code: 'CUST-1042',
    avatar: 'AC', 
    gradient: 'from-green-500 to-emerald-700',
    meta: 'Net 30 · USD · Credit: $50,000',
  });
  const [selectedAddress, setSelectedAddress] = useState('San Francisco, CA');
  const [selectedPaymentTerm, setSelectedPaymentTerm] = useState('Net 30');
  const [toast, setToast] = useState('');
  const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false);
  const [syncBillAddress, setSyncBillAddress] = useState(true);
  const [activeAddressTab, setActiveAddressTab] = useState('ship');

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 2600);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* BACKGROUND NOISE TEXTURE */}
      <div
        className="fixed inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,
        }}
      />

      {/* HEADER */}
      <Header />

      {/* MAIN CONTENT */}
      <div className="relative z-10 max-w-7xl mx-auto px-7 py-7 pb-20">
        {/* PAGE HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between mb-7"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              New Sales Order
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Fill in the details below — all master data loads automatically from your setup
            </p>
          </div>
          <StatusPill status="Draft" />
        </motion.div>

        {/* PROGRESS STEPS */}
        <ProgressSteps />

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mt-7">
          {/* LEFT COLUMN - FORM SECTIONS */}
          <div className="xl:col-span-3 space-y-4">
            <FormSection
              id="entity"
              title="Company Entity"
              icon="🏢"
              isExpanded={expandedSections.entity}
              onToggle={() => toggleSection('entity')}
              required
            >
              <EntitySelector
                selectedEntity={selectedEntity}
                onSelect={(name) => {
                  setSelectedEntity(name);
                  showToast(`🏢 Entity set to ${name}`);
                }}
              />
            </FormSection>

            <FormSection
              id="orderType"
              title="Order Type"
              icon="📄"
              isExpanded={expandedSections.orderType}
              onToggle={() => toggleSection('orderType')}
              required
            >
              <OrderTypeSelector
                selectedOrderType={selectedOrderType}
                onSelect={(type) => {
                  setSelectedOrderType(type);
                  showToast(`📄 ${type} selected`);
                }}
              />
              <OrderDetailsFields />
            </FormSection>

            <FormSection
              id="customer"
              title="Customer"
              icon="👤"
              isExpanded={expandedSections.customer}
              onToggle={() => toggleSection('customer')}
              required
            >
              <CustomerSelector
                selectedCustomer={selectedCustomer}
                onSelect={(customer) => {
                  setSelectedCustomer(customer);
                  setCustomerDropdownOpen(false);
                  showToast(`👤 ${customer.name} loaded from master`);
                }}
                isOpen={customerDropdownOpen}
                onToggleOpen={() => setCustomerDropdownOpen(!customerDropdownOpen)}
              />
              <CustomerDetailsFields />
            </FormSection>

            <FormSection
              id="address"
              title="Addresses — Ship · Bill · Payment"
              icon="📍"
              isExpanded={expandedSections.address}
              onToggle={() => toggleSection('address')}
            >
              <AddressesSection
                selectedAddress={selectedAddress}
                onSelectAddress={(addr) => {
                  setSelectedAddress(addr);
                  showToast('📍 Address selected');
                }}
                syncBillAddress={syncBillAddress}
                onSyncToggle={() => setSyncBillAddress(!syncBillAddress)}
                selectedPaymentTerm={selectedPaymentTerm}
                onSelectPaymentTerm={(term) => {
                  setSelectedPaymentTerm(term);
                  showToast(`💳 Payment terms: ${term}`);
                }}
                activeTab={activeAddressTab}
                onTabChange={setActiveAddressTab}
              />
            </FormSection>

            <FormSection
              id="additional"
              title="Additional Information"
              icon="⚙️"
              isExpanded={expandedSections.additional}
              onToggle={() => toggleSection('additional')}
            >
              <AdditionalInfoFields />
            </FormSection>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="xl:col-span-1">
            <div className="sticky top-20 max-h-[calc(100vh-100px)] overflow-y-auto space-y-4 pr-2">
              <OrderSummary
                entity={selectedEntity}
                orderType={selectedOrderType}
                customer={selectedCustomer.name}
                paymentTerm={selectedPaymentTerm}
                address={selectedAddress}
                onNextClick={() => showToast('✅ Proceeding to Line Items →')}
                onSaveClick={() => showToast('📋 Draft saved successfully')}
                onPreviewClick={() => showToast('👁 Preview generated')}
              />
              <ValidationChecklist />
            </div>
          </div>
        </div>
      </div>

      {/* TOAST NOTIFICATION */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: '-50%' }}
            animate={{ opacity: 1, y: -4, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-7 left-1/2 z-50 px-6 py-3 bg-slate-800 border border-slate-700 rounded-full text-sm font-medium text-white shadow-2xl whitespace-nowrap"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// HEADER COMPONENT
// ═══════════════════════════════════════════════════════════════════════

function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-7 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-xs font-bold text-white">
            SF
          </div>
          <span className="text-base font-semibold text-white">SalesFlow</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Sales</span>
          <span className="text-slate-600">›</span>
          <span>Orders</span>
          <span className="text-slate-600">›</span>
          <span className="text-white">New Order</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-full text-xs font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20">
            SO-2026-0413
          </div>
          <button className="px-4 py-1.5 rounded text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition">
            Save Draft
          </button>
          <button className="px-4 py-1.5 rounded text-xs font-medium text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:opacity-90 transition">
            Submit Order
          </button>
        </div>
      </div>
    </header>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// PROGRESS STEPS
// ═══════════════════════════════════════════════════════════════════════

function ProgressSteps() {
  const steps = [
    { num: '✓', label: 'Entity', sub: 'Global HQ', done: true },
    { num: '2', label: 'Order Type', sub: 'Select type', active: true },
    { num: '3', label: 'Customer', sub: 'Not selected' },
    { num: '4', label: 'Addresses', sub: 'Ship · Bill · Pay' },
    { num: '5', label: 'Line Items', sub: 'Add products' },
    { num: '6', label: 'Review', sub: 'Confirm & submit' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-0 bg-slate-800 border border-slate-700 rounded-2xl p-4 mb-6 overflow-x-auto"
    >
      {steps.map((step, i) => (
        <React.Fragment key={i}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-slate-700/50 transition flex-shrink-0"
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                step.done
                  ? 'bg-emerald-500/20 border border-emerald-500 text-emerald-400'
                  : step.active
                    ? 'bg-amber-500/20 border border-amber-500 text-amber-400'
                    : 'bg-slate-700 border border-slate-600 text-slate-400'
              }`}
            >
              {step.num}
            </div>
            <div className="text-xs">
              <div
                className={`font-semibold ${
                  step.done ? 'text-emerald-400' : step.active ? 'text-amber-400' : 'text-slate-300'
                }`}
              >
                {step.label}
              </div>
              <div className="text-slate-500 text-xs">{step.sub}</div>
            </div>
          </motion.div>

          {i < steps.length - 1 && (
            <div
              className={`h-px flex-1 min-w-5 max-w-12 mx-1 ${
                step.done ? 'bg-emerald-500/40' : 'bg-slate-700'
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// FORM SECTION COMPONENT
// ═══════════════════════════════════════════════════════════════════════

function FormSection({ id, title, icon, isExpanded, onToggle, required, children }) {
  return (
    <motion.div
      layout
      className="border border-slate-700 bg-slate-800 rounded-2xl overflow-hidden"
    >
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between bg-slate-800/50 border-b border-slate-700 hover:bg-slate-800/70 transition"
      >
        <div className="flex items-center gap-3">
          <div className="text-2xl">{icon}</div>
          <span className="text-sm font-semibold text-white">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          {required && <span className="text-xs font-semibold text-amber-500 uppercase">Required</span>}
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="text-slate-400"
          >
            <ChevronDown size={18} />
          </motion.div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="px-6 py-5"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// ENTITY SELECTOR
// ═══════════════════════════════════════════════════════════════════════

function EntitySelector({ selectedEntity, onSelect }) {
  const entities = [
    { name: 'Global HQ', code: 'ENT-001', location: 'Singapore', abbr: 'GH', gradient: 'from-amber-500 to-orange-600' },
    { name: 'US Division', code: 'ENT-002', location: 'New York, USA', abbr: 'US', gradient: 'from-blue-500 to-indigo-600' },
    { name: 'India Ops', code: 'ENT-003', location: 'Chennai, IN', abbr: 'IO', gradient: 'from-emerald-500 to-teal-700' },
    { name: 'EU Branch', code: 'ENT-004', location: 'Amsterdam, NL', abbr: 'EU', gradient: 'from-purple-500 to-violet-700' },
    { name: 'ME Office', code: 'ENT-005', location: 'Dubai, UAE', abbr: 'ME', gradient: 'from-orange-500 to-red-600' },
  ];

  return (
    <div>
      <p className="text-xs text-slate-400 mb-4">
        Select the entity this sales order belongs to. This determines the legal entity, currency, and tax rules.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
        {entities.map((entity) => (
          <motion.button
            key={entity.code}
            onClick={() => onSelect(entity.name)}
            whileHover={{ y: -4 }}
            className={`p-4 rounded-xl border-2 transition ${
              selectedEntity === entity.name
                ? 'border-amber-500 bg-amber-500/10'
                : 'border-slate-700 bg-slate-800 hover:border-slate-600'
            }`}
          >
            {selectedEntity === entity.name && <Check className="w-4 h-4 text-amber-400 mb-2" />}
            <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${entity.gradient} flex items-center justify-center font-bold text-white text-xs mb-2`}>
              {entity.abbr}
            </div>
            <div className="text-xs font-semibold text-white mb-0.5">{entity.name}</div>
            <div className="text-xs text-slate-500 mb-1">{entity.code}</div>
            <div className="text-xs text-slate-400">📍 {entity.location}</div>
          </motion.button>
        ))}
      </div>
      <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs text-blue-300">
        ℹ️ Currency, tax code and warehouse will auto-load based on selected entity
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// ORDER TYPE SELECTOR
// ═══════════════════════════════════════════════════════════════════════

function OrderTypeSelector({ selectedOrderType, onSelect }) {
  const orderTypes = [
    { name: 'Standard Sales Order', icon: '📦', desc: 'Regular one-time customer order with immediate fulfillment', popular: true },
    { name: 'Blanket Agreement', icon: '📋', desc: 'Long-term agreement with scheduled releases over a period' },
    { name: 'Return Order', icon: '↩️', desc: 'Customer return with credit note or replacement' },
    { name: 'Sample Order', icon: '🧪', desc: 'Free or discounted samples for evaluation purposes' },
    { name: 'Service Order', icon: '🔧', desc: 'Non-inventory service or maintenance billing' },
    { name: 'Drop Shipment', icon: '🚚', desc: 'Ship directly from vendor to customer location' },
  ];

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        {orderTypes.map((type) => (
          <motion.button
            key={type.name}
            onClick={() => onSelect(type.name)}
            whileHover={{ y: -2 }}
            className={`relative p-4 rounded-xl border-2 text-left transition ${
              selectedOrderType === type.name
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-slate-700 bg-slate-800 hover:border-slate-600'
            }`}
          >
            {type.popular && (
              <span className="absolute top-3 right-3 text-xs font-semibold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                Popular
              </span>
            )}
            {selectedOrderType === type.name && (
              <Check className="w-4 h-4 text-blue-400 absolute top-3 right-3" />
            )}
            <div className="text-2xl mb-2">{type.icon}</div>
            <div className="font-semibold text-white text-sm mb-1">{type.name}</div>
            <div className="text-xs text-slate-400 leading-snug">{type.desc}</div>
          </motion.button>
        ))}
      </div>

      <div className="h-px bg-slate-700 mb-6" />
    </div>
  );
}

function OrderDetailsFields() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <FormField label="Order Date" type="date" value="2026-05-22" required />
      <FormField label="Delivery Date" type="date" value="2026-06-05" required />
      <FormField label="Valid Until" type="date" value="2026-06-30" />
      <FormField label="Priority" type="select" options={['Normal', 'High', 'Urgent', 'Low']} />
      <FormField label="Warehouse" type="select" options={['WH-01 — Main Store', 'WH-02 — Secondary', 'WH-03 — Export']} required />
      <FormField label="Currency" type="select" options={['USD — US Dollar', 'SGD — Singapore Dollar', 'EUR — Euro', 'INR — Indian Rupee']} />
      <FormField label="Sales Rep" type="select" options={['Michael Brown', 'Sarah Lee', 'Tom Wilson']} />
      <FormField label="Price List" type="select" options={['Standard Price', 'Wholesale Price', 'VIP Price']} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// CUSTOMER SELECTOR
// ═══════════════════════════════════════════════════════════════════════

function CustomerSelector({ selectedCustomer, onSelect, isOpen, onToggleOpen }) {
  const customers = [
    { name: 'Acme Corporation', code: 'CUST-1042', avatar: 'AC', gradient: 'from-emerald-500 to-teal-700', meta: 'Net 30 · USD · Credit: $50,000', limit: '$50K' },
    { name: 'Bright Supplies Ltd', code: 'CUST-1107', avatar: 'BS', gradient: 'from-blue-500 to-indigo-600', meta: 'Net 15 · USD · Credit: $30,000', limit: '$30K' },
    { name: 'Global Trade Ltd', code: 'CUST-2034', avatar: 'GT', gradient: 'from-amber-500 to-orange-600', meta: 'Net 45 · EUR · Credit: $100,000', limit: '$100K' },
    { name: 'NovaTech Inc', code: 'CUST-3011', avatar: 'NT', gradient: 'from-purple-500 to-violet-700', meta: 'COD · USD · Credit: $0', limit: 'COD only' },
    { name: 'Vertex Solutions', code: 'CUST-4022', avatar: 'VS', gradient: 'from-orange-500 to-red-600', meta: 'Net 60 · SGD · Credit: $75,000', limit: '$75K' },
  ];

  return (
    <div className="relative">
      <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Search Customer Master *</label>
      <motion.button
        onClick={onToggleOpen}
        className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition ${
          isOpen ? 'border-amber-500 bg-slate-800' : 'border-slate-700 bg-slate-800 hover:border-slate-600'
        }`}
      >
        <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${selectedCustomer.gradient} flex items-center justify-center font-bold text-white text-xs flex-shrink-0`}>
          {selectedCustomer.avatar}
        </div>
        <div className="flex-1 text-left">
          <div className="text-sm font-semibold text-white">{selectedCustomer.name}</div>
          <div className="text-xs text-slate-400">{selectedCustomer.code} · {selectedCustomer.meta.split('·')[0]}</div>
        </div>
        <span className="text-xs text-slate-400">Change ›</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-2 border-b border-slate-700 flex items-center gap-2">
              <span className="text-slate-500">🔍</span>
              <input type="text" placeholder="Search by name, code, phone..." className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 outline-none" />
            </div>
            <div className="max-h-56 overflow-y-auto">
              {customers.map((cust) => (
                <motion.button
                  key={cust.code}
                  onClick={() =>
                    onSelect({
                      name: cust.name,
                      code: cust.code,
                      avatar: cust.avatar,
                      gradient: cust.gradient,
                      meta: cust.meta,
                    })
                  }
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-700/50 transition border-b border-slate-700 last:border-b-0"
                >
                  <div className={`w-8 h-8 rounded bg-gradient-to-br ${cust.gradient} flex items-center justify-center font-bold text-white text-xs`}>
                    {cust.avatar}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-xs font-semibold text-white">{cust.name}</div>
                    <div className="text-xs text-slate-500">{cust.code}</div>
                  </div>
                  <div className={`text-xs font-semibold ${cust.limit === 'COD only' ? 'text-orange-400' : 'text-emerald-400'}`}>
                    {cust.limit}
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CustomerDetailsFields() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-700">
      <FormField label="Contact Person" value="Jane Smith" />
      <FormField label="Contact Email" type="email" value="jane@acmecorp.com" />
      <FormField label="Contact Phone" type="tel" />
      <FormField label="Customer PO #" />
      <FormField label="Customer PO Date" type="date" />
      <FormField label="Tax Registration #" />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// ADDRESSES SECTION
// ═══════════════════════════════════════════════════════════════════════

function AddressesSection({
  selectedAddress,
  onSelectAddress,
  syncBillAddress,
  onSyncToggle,
  selectedPaymentTerm,
  onSelectPaymentTerm,
  activeTab,
  onTabChange,
}) {
  const addresses = [
    { type: 'Primary Shipping', line1: '123 Main Street, Suite 400', line2: 'San Francisco, CA 94105 · USA', default: true },
    { type: 'Warehouse / Dock', line1: '789 Industrial Blvd, Dock B', line2: 'Oakland, CA 94601 · USA' },
    { type: 'Branch Office', line1: '55 Market Street, Floor 12', line2: 'San Jose, CA 95113 · USA' },
  ];

  const paymentTerms = [
    { name: 'Net 30', desc: 'Due in 30 days' },
    { name: 'Net 15', desc: 'Due in 15 days' },
    { name: 'Net 45', desc: 'Due in 45 days' },
    { name: 'Net 60', desc: 'Due in 60 days' },
    { name: 'COD', desc: 'Cash on delivery' },
    { name: 'Advance', desc: 'Pay before ship' },
    { name: '2/10 Net 30', desc: '2% disc if paid in 10' },
    { name: 'EOM', desc: 'End of month' },
  ];

  return (
    <div>
      <div className="flex gap-2 mb-6 bg-slate-900 border border-slate-700 rounded-lg p-0.5">
        {['ship', 'bill', 'pay'].map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`flex-1 px-4 py-2 text-xs font-medium rounded transition ${
              activeTab === tab
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            {tab === 'ship' && '🚚 Ship To'}
            {tab === 'bill' && '💳 Bill To'}
            {tab === 'pay' && '🏦 Payment'}
          </button>
        ))}
      </div>

      {activeTab === 'ship' && (
        <div>
          <p className="text-xs text-slate-400 mb-3">Addresses loaded from customer master — select or override</p>
          <div className="space-y-2 mb-6">
            {addresses.map((addr) => (
              <motion.button
                key={addr.line1}
                onClick={() => onSelectAddress(addr.line1)}
                whileHover={{ x: 4 }}
                className={`w-full flex items-start gap-3 p-4 rounded-lg border-2 text-left transition ${
                  selectedAddress === addr.line1
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 ${
                    selectedAddress === addr.line1
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-slate-600 bg-transparent'
                  }`}
                />
                <div className="flex-1">
                  <div className="text-xs font-semibold text-slate-400 uppercase mb-1">{addr.type}</div>
                  <div className="text-sm font-semibold text-white">{addr.line1}</div>
                  <div className="text-xs text-slate-400">{addr.line2}</div>
                </div>
                {addr.default && <span className="text-xs font-semibold text-emerald-400">Default</span>}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'bill' && (
        <div>
          <motion.button
            onClick={onSyncToggle}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 hover:border-slate-600 transition mb-4 w-fit"
          >
            <div
              className={`w-7 h-4 rounded-full border transition flex items-center ${
                syncBillAddress ? 'bg-blue-500 border-blue-500' : 'bg-slate-700 border-slate-600'
              }`}
            >
              <motion.div
                animate={{ x: syncBillAddress ? 10 : 2 }}
                className="w-3 h-3 rounded-full bg-white"
              />
            </div>
            <span className="text-xs font-medium text-slate-300">Same as Ship To address</span>
          </motion.button>
          {!syncBillAddress && (
            <div className="space-y-2">
              {addresses.slice(0, 1).map((addr) => (
                <motion.button
                  key={addr.line1}
                  className="w-full flex items-start gap-3 p-4 rounded-lg border-2 border-blue-500 bg-blue-500/10 text-left"
                >
                  <div className="w-4 h-4 rounded-full border-2 border-blue-500 bg-blue-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-slate-400 uppercase mb-1">Billing / Accounts</div>
                    <div className="text-sm font-semibold text-white">456 Finance Avenue, Floor 8</div>
                    <div className="text-xs text-slate-400">San Francisco, CA 94103 · USA</div>
                  </div>
                  <span className="text-xs font-semibold text-emerald-400">Default</span>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'pay' && (
        <div>
          <div className="mb-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 tracking-wider">Payment Terms</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {paymentTerms.map((term) => (
                <motion.button
                  key={term.name}
                  onClick={() => onSelectPaymentTerm(term.name)}
                  whileHover={{ scale: 1.02 }}
                  className={`p-3 rounded-lg border-2 text-center transition ${
                    selectedPaymentTerm === term.name
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div className={`text-sm font-semibold ${selectedPaymentTerm === term.name ? 'text-purple-400' : 'text-white'}`}>
                    {term.name}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">{term.desc}</div>
                </motion.button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 tracking-wider">Payment Method</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Payment Method" type="select" options={['Bank Transfer', 'Cheque', 'Credit Card', 'Letter of Credit', 'Cash']} />
              <FormField label="Bank Account" type="select" options={['Acme — DBS ****4521', 'Acme — OCBC ****8834']} />
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 tracking-wider">Credit Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-slate-700/30 border border-slate-700 rounded-lg">
                <div className="text-xs text-slate-400 mb-1">Credit Limit</div>
                <div className="text-sm font-semibold text-emerald-400">$50,000.00</div>
              </div>
              <div className="p-3 bg-slate-700/30 border border-slate-700 rounded-lg">
                <div className="text-xs text-slate-400 mb-1">Outstanding Balance</div>
                <div className="text-sm font-semibold text-amber-400">$12,450.00</div>
              </div>
              <div className="p-3 bg-slate-700/30 border border-slate-700 rounded-lg">
                <div className="text-xs text-slate-400 mb-1">Available Credit</div>
                <div className="text-sm font-semibold text-blue-400">$37,550.00</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// ADDITIONAL INFO
// ═══════════════════════════════════════════════════════════════════════

function AdditionalInfoFields() {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <FormField label="Shipping Method" type="select" options={['Standard Freight', 'Express Air', 'Sea Freight', 'Customer Pickup']} />
        <FormField label="Incoterms" type="select" options={['FOB', 'CIF', 'DDP', 'EXW', 'DAP']} />
        <FormField label="Tax Group" type="select" options={['Standard GST 9%', 'Zero Rated', 'Exempt', 'US Sales Tax']} />
        <FormField label="Cost Center" type="select" options={['CC-001 — Sales APAC', 'CC-002 — Sales Americas', 'CC-003 — Sales EMEA']} />
        <FormField label="Project Code" />
        <FormField label="Contract Reference" />
      </div>
      <div className="grid grid-cols-1 gap-4">
        <FormField label="Internal Remarks" type="textarea" placeholder="Notes visible to internal team only…" />
        <FormField label="Customer Remarks" type="textarea" placeholder="Notes printed on order confirmation…" />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// FORM FIELD COMPONENT
// ═══════════════════════════════════════════════════════════════════════

function FormField({ label, type = 'text', value = '', placeholder = '', options = [], required = false }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-slate-400 uppercase">
        {label} {required && <span className="text-orange-500">*</span>}
      </label>
      {type === 'select' ? (
        <select className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:border-amber-500 focus:bg-slate-800/50 outline-none transition">
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          placeholder={placeholder}
          rows={3}
          className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm placeholder-slate-500 focus:border-amber-500 focus:bg-slate-800/50 outline-none transition resize-none"
        />
      ) : (
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm placeholder-slate-500 focus:border-amber-500 focus:bg-slate-800/50 outline-none transition"
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SIDEBAR - ORDER SUMMARY
// ═══════════════════════════════════════════════════════════════════════

function OrderSummary({ entity, orderType, customer, paymentTerm, address, onNextClick, onSaveClick, onPreviewClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-slate-700 bg-slate-800 rounded-2xl overflow-hidden"
    >
      <div className="px-5 py-4 border-b border-slate-700 flex items-center justify-between">
        <h3 className="text-sm font-bold text-white">Order Summary</h3>
        <StatusPill status="Draft" size="sm" />
      </div>

      <div className="px-5 py-4 space-y-2">
        <SummaryRow label="Order #" value="SO-2026-0413" accent />
        <SummaryRow label="Entity" value={entity} />
        <SummaryRow label="Order Type" value={orderType} />
        <SummaryRow label="Customer" value={customer} />
        <SummaryRow label="Order Date" value="22 May 2026" />
        <SummaryRow label="Delivery" value="05 Jun 2026" />
        <SummaryRow label="Payment" value={paymentTerm} />
        <SummaryRow label="Currency" value="USD" />
        <SummaryRow label="Warehouse" value="WH-01 Main" />
        <SummaryRow label="Ship To" value={address} blue />
      </div>

      <div className="px-5 py-3 border-t border-slate-700 space-y-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNextClick}
          className="w-full py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold hover:opacity-90 transition"
        >
          Next: Add Items →
        </motion.button>
        <button
          onClick={onSaveClick}
          className="w-full py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium hover:bg-slate-700 transition"
        >
          Save as Draft
        </button>
        <button
          onClick={onPreviewClick}
          className="w-full py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium hover:bg-slate-700 transition"
        >
          Preview Order
        </button>
      </div>
    </motion.div>
  );
}

function SummaryRow({ label, value, accent, blue }) {
  return (
    <div className="flex items-start justify-between text-xs py-1.5 border-b border-slate-700/50 last:border-b-0">
      <span className="text-slate-400">{label}</span>
      <span
        className={`font-medium text-right ${
          accent ? 'text-amber-400 font-mono' : blue ? 'text-blue-400' : 'text-white'
        }`}
      >
        {value}
      </span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// VALIDATION CHECKLIST
// ═══════════════════════════════════════════════════════════════════════

function ValidationChecklist() {
  const items = [
    { label: 'Entity selected', done: true },
    { label: 'Order type chosen', done: true },
    { label: 'Customer selected', done: true },
    { label: 'Ship to address set', done: true },
    { label: 'Bill to address set', done: true },
    { label: 'Payment terms set', done: true },
    { label: 'Line items added', done: false },
    { label: 'Order reviewed', done: false },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="border border-slate-700 bg-slate-800 rounded-2xl overflow-hidden"
    >
      <div className="px-5 py-4 border-b border-slate-700">
        <h3 className="text-sm font-bold text-white">Completion Checklist</h3>
      </div>

      <div className="px-5 py-4">
        <ul className="space-y-2">
          {items.map((item, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-center gap-2 text-xs ${item.done ? 'text-emerald-400' : 'text-slate-400'}`}
            >
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                  item.done
                    ? 'bg-emerald-500/20 border border-emerald-500'
                    : 'bg-slate-700 border border-slate-600'
                }`}
              >
                {item.done && <Check size={10} />}
              </div>
              {item.label}
            </motion.li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// STATUS PILL
// ═══════════════════════════════════════════════════════════════════════

function StatusPill({ status, size = 'md' }) {
  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${
        size === 'sm'
          ? 'px-3 py-1.5 text-xs bg-amber-500/20 text-amber-400'
          : 'px-4 py-2 text-sm bg-amber-500/20 text-amber-400'
      }`}
    >
      <div className="w-2 h-2 rounded-full bg-current" />
      {status}
    </div>
  );
}