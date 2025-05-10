import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Order } from '@shared/schema';
import { Loader2, CheckCircle2 } from 'lucide-react';

export default function CheckoutSuccess() {
  const [searchParams] = useState(new URLSearchParams(window.location.search));
  const orderId = searchParams.get('order_id');
  const [, setLocation] = useLocation();

  const { data: order, isLoading, error } = useQuery<Order>({
    queryKey: [`/api/order/${orderId}`],
    enabled: !!orderId,
  });

  useEffect(() => {
    if (!orderId) {
      setLocation('/');
    }
  }, [orderId, setLocation]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-32 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 mx-auto animate-spin text-black mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Processing your order...</h2>
          <p className="text-gray-500">Please wait while we confirm your payment.</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-32 max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-500">Order Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-6">There was a problem processing your order. Please contact customer support.</p>
            <Button 
              onClick={() => setLocation('/')}
              className="bg-black text-white hover:bg-gray-800 transition-colors"
            >
              Return to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-32 max-w-lg">
      <Card className="shadow-md">
        <CardHeader className="text-center border-b pb-6">
          <CheckCircle2 className="h-16 w-16 mx-auto text-green-500 mb-4" />
          <CardTitle className="text-2xl">Order Successful!</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Order ID</p>
              <p className="font-medium">{order.id}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Amount Paid</p>
              <p className="font-medium">${parseFloat(order.amount as any).toFixed(2)}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Payment Status</p>
              <p className="font-medium capitalize">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                {order.status}
              </p>
            </div>
            
            <div className="pt-4 text-center">
              <p className="text-gray-500 mb-6">
                A confirmation email has been sent to your email address.
              </p>
              <Button 
                onClick={() => setLocation('/')}
                className="bg-black text-white hover:bg-gray-800 transition-colors"
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
