import { Card } from '@/features/ui/Card';

export default function WithdrawPage() {
  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-6" style={{ color: 'var(--color-hl-text)' }}>
        Withdraw
      </h1>
      
      <Card>
        <div className="p-6">
          <p className="text-lg mb-4" style={{ color: 'var(--color-hl-text)' }}>
            Withdraw your funds from cream.fun
          </p>
          
          <div className="space-y-4">
            <div className="p-4 border rounded-lg" style={{ 
              backgroundColor: 'var(--color-hl-surface)',
              borderColor: 'var(--color-hl-border)'
            }}>
              <h3 className="font-semibold mb-2" style={{ color: 'var(--color-hl-text)' }}>
                Coming Soon
              </h3>
              <p className="text-sm" style={{ color: 'var(--color-hl-muted)' }}>
                Withdrawal functionality will be available soon. This page will include:
                - Multiple withdrawal methods
                - Fee calculations
                - Processing times
                - Transaction history
                - Security confirmations
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
