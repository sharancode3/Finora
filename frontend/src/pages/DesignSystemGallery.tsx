import React, { useState } from 'react';
import { Card, CardHeader, CardBody, CardFooter } from '../components/ui/Card';
import { StatCard } from '../components/ui/StatCard';
import { TrustBadge } from '../components/ui/TrustBadge';
import { SeverityBadge } from '../components/ui/SeverityBadge';
import { DataTable } from '../components/ui/DataTable';
import { AmountDisplay } from '../components/ui/AmountDisplay';
import { Timeline } from '../components/ui/Timeline';
import { WhyButton } from '../components/ui/WhyButton';
import { ChatPanel } from '../components/ui/ChatPanel';
import { ProgressRing } from '../components/ui/ProgressRing';
import { AreaChart } from '../components/ui/AreaChart';
import { BarChart } from '../components/ui/BarChart';
import { EmptyState } from '../components/ui/EmptyState';
import { ConfirmationModal } from '../components/ui/ConfirmationModal';
import { FilterBar } from '../components/ui/FilterBar';
import { SearchInput } from '../components/ui/SearchInput';
import { Button } from '../components/ui/Button';
import { Tooltip } from '../components/ui/Tooltip';
import { Skeleton } from '../components/ui/Skeleton';
import { toast } from '../components/ui/Toast';
import { InstitutionLogo } from '../components/ui/InstitutionLogo';
import { ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';

const MOCK_TABLE_DATA = [
  { id: '1', date: '2026-08-20', description: 'Settlement ST_001', amount: 50000.50, status: 'VERIFIED' },
  { id: '2', date: '2026-08-21', description: 'Settlement ST_002', amount: -1500.00, status: 'EXCEPTION' },
];

const MOCK_TIMELINE = [
  { id: 't1', title: 'Payment Initiated', subtitle: 'Razorpay', timestamp: '10:00 AM', icon: FileText, statusColor: 'bg-slate-300' },
  { id: 't2', title: 'Settled to Bank', subtitle: 'HDFC Current A/c', timestamp: '11:30 AM', icon: CheckCircle2, statusColor: 'bg-success' },
];

const MOCK_CHAT = [
  { id: 'm1', role: 'user' as const, content: 'Why did the match rate drop yesterday?' },
  { id: 'm2', role: 'assistant' as const, content: 'The match rate dropped to 94.2% due to 3 unresolved exceptions in the HDFC feed.', evidenceCount: 3, sourceChips: ['EXC-091', 'EXC-092', 'EXC-093'] },
];

const MOCK_CHART_DATA = [
  { name: 'Mon', actual: 40000, projected: 42000 },
  { name: 'Tue', actual: 30000, projected: 31000 },
  { name: 'Wed', actual: 20000, projected: 19000 },
  { name: 'Thu', actual: 27800, projected: 29000 },
  { name: 'Fri', actual: 18900, projected: 20000 },
];

export default function DesignSystemGallery() {
  const [searchValue, setSearchValue] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="space-y-12 pb-24">
      <div>
        <h1 className="mb-2">Design System Gallery</h1>
        <p>Verification for core UI components. All strictly using design system tokens.</p>
      </div>

      <section>
        <h2 className="mb-6">Badges & Tags</h2>
        <div className="flex flex-wrap gap-8">
          <div className="space-y-4">
            <h3 className="text-sm text-slate-500 uppercase">TrustBadge</h3>
            <div className="flex gap-4">
              <TrustBadge state="VERIFIED" />
              <TrustBadge state="PROBABLE" />
              <TrustBadge state="REVIEW REQUIRED" />
              <TrustBadge state="EXCEPTION" />
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm text-slate-500 uppercase">SeverityBadge</h3>
            <div className="flex gap-4">
              <SeverityBadge severity="CRITICAL" />
              <SeverityBadge severity="HIGH" />
              <SeverityBadge severity="MEDIUM" />
              <SeverityBadge severity="LOW" />
            </div>
          </div>
        </div>
      </section>

      {/* Institution Brand Marks Showcase */}
      <section>
        <h2 className="mb-4">Institution Brand Marks &amp; Badges</h2>
        <p className="text-xs text-slate-500 mb-6">Authentic SVG brand vectors and official corporate palettes for connected financial institutions.</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 flex items-center gap-3">
            <InstitutionLogo name="Razorpay Gateway" size="lg" />
            <div>
              <div className="font-bold text-xs text-slate-900">Razorpay</div>
              <div className="text-[10px] text-slate-500 font-mono">Brand: #0B72E7</div>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-3">
            <InstitutionLogo name="Kotak Mahindra Bank" size="lg" />
            <div>
              <div className="font-bold text-xs text-slate-900">Kotak Mahindra</div>
              <div className="text-[10px] text-slate-500 font-mono">Brand: #ED1C24</div>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-3">
            <InstitutionLogo name="HDFC Bank" size="lg" />
            <div>
              <div className="font-bold text-xs text-slate-900">HDFC Bank</div>
              <div className="text-[10px] text-slate-500 font-mono">Brand: #004B87</div>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-3">
            <InstitutionLogo name="PayPal" size="lg" />
            <div>
              <div className="font-bold text-xs text-slate-900">PayPal Wallet</div>
              <div className="text-[10px] text-slate-500 font-mono">Brand: #003087</div>
            </div>
          </Card>
        </div>
      </section>

      <section>
        <h2 className="mb-6">Buttons & Inputs</h2>
        <div className="flex flex-wrap gap-8 items-start">
          <div className="space-y-4">
            <div className="flex gap-4">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
          </div>
          <div className="w-64">
            <SearchInput value={searchValue} onChange={setSearchValue} placeholder="Search records..." />
          </div>
          <div>
            <FilterBar 
              options={[{ label: 'All', value: 'all' }, { label: 'Exceptions', value: 'exceptions' }]} 
              activeFilter={activeFilter} 
              onChange={setActiveFilter} 
            />
          </div>
          <div className="flex items-center gap-4">
            <Tooltip content="Provides detailed component breakdown">
              <Button variant="ghost">Hover me</Button>
            </Tooltip>
            <WhyButton>
              <p>Because the match engine used fuzzy logic on the UTR.</p>
            </WhyButton>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-6">Cards & Stats</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard label="Overall Match Rate" value="98.4%" delta={1.2} deltaLabel="vs last week" trustState="VERIFIED" />
          <StatCard label="Pending Exceptions" value="12" delta={-5} deltaLabel="resolved today" trustState="EXCEPTION" />
          <Card className="col-span-2">
            <CardHeader><h3 className="text-[16px]">Standard Card</h3></CardHeader>
            <CardBody>This is the card body. Amount: <AmountDisplay amount={150000} /></CardBody>
            <CardFooter>Footer area</CardFooter>
          </Card>
        </div>
      </section>

      <section>
        <h2 className="mb-6">Data Display</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h3 className="text-sm text-slate-500 uppercase mb-4">DataTable (Expandable)</h3>
            <DataTable 
              columns={[
                { key: 'date', header: 'Date' },
                { key: 'description', header: 'Description' },
                { key: 'amount', header: 'Amount', align: 'right', render: (item) => <AmountDisplay amount={item.amount} /> },
                { key: 'status', header: 'Status', render: (item) => <TrustBadge state={item.status as any} /> }
              ]}
              data={MOCK_TABLE_DATA}
              expandable
              renderExpandedRow={(item) => (
                <div className="p-4 bg-muted/30">
                  <p>Details for {item.description}. <WhyButton>Matched exactly on Amount and Date.</WhyButton></p>
                </div>
              )}
            />
            
            <div className="mt-8 grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm text-slate-500 uppercase mb-4">Timeline</h3>
                <Card className="p-6"><Timeline nodes={MOCK_TIMELINE} /></Card>
              </div>
              <div>
                <h3 className="text-sm text-slate-500 uppercase mb-4">Empty State</h3>
                <Card><EmptyState icon={ShieldAlert} title="No Alerts" description="All systems are green." /></Card>
              </div>
            </div>
          </div>
          
          <div className="h-[600px]">
            <h3 className="text-sm text-slate-500 uppercase mb-4">ChatPanel</h3>
            <div className="h-full rounded-xl overflow-hidden border border-border shadow-sm">
              <ChatPanel messages={MOCK_CHAT} onSendMessage={(msg) => console.log(msg)} />
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-6">Charts & Visualization</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6">
            <h3 className="text-sm text-slate-500 uppercase mb-6 text-center">ProgressRing</h3>
            <ProgressRing 
              data={[
                { label: 'Exact', value: 80, color: '#10B981' },
                { label: 'Batched', value: 15, color: '#0284c7' },
                { label: 'Fuzzy', value: 5, color: '#f59e0b' }
              ]}
              centerLabel="Matched"
              centerValue="100%"
            />
          </Card>
          <Card className="p-6 col-span-2">
            <h3 className="text-sm text-slate-500 uppercase mb-6">AreaChart</h3>
            <AreaChart 
              data={MOCK_CHART_DATA} 
              xAxisKey="name" 
              series={[
                { key: 'actual', name: 'Actual Inflow', color: '#10B981', fillOpacity: 0.2 },
                { key: 'projected', name: 'Projected', color: '#0284c7', fillOpacity: 0.1 }
              ]} 
            />
          </Card>
        </div>
      </section>

      <section>
        <h2 className="mb-6">Overlays & Actions</h2>
        <div className="flex gap-4">
          <Button onClick={() => setModalOpen(true)}>Open Modal</Button>
          <Button variant="secondary" onClick={() => toast.success('Action successful!')}>Trigger Success Toast</Button>
          <Button variant="danger" onClick={() => toast.error('Something went wrong.')}>Trigger Error Toast</Button>
        </div>
        
        <ConfirmationModal 
          isOpen={modalOpen} 
          title="Delete Batch?" 
          description="Are you sure you want to delete this reconciliation batch? This action cannot be undone."
          confirmLabel="Delete"
          onCancel={() => setModalOpen(false)}
          onConfirm={() => { toast.success('Batch deleted'); setModalOpen(false); }}
        />
      </section>
      
      <section>
        <h2 className="mb-6">Skeleton Loader</h2>
        <Card className="p-6">
          <Skeleton className="w-full h-8 mb-4" />
          <Skeleton className="w-3/4 h-4 mb-2" />
          <Skeleton className="w-1/2 h-4" />
        </Card>
      </section>
    </div>
  );
}
