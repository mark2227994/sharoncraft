import { isAuthorizedRequest } from '../../../lib/admin-auth';
import { readWaOrders } from '../../../lib/store';
import { readCustomOrders } from '../../../lib/store';
import { readCustomers } from '../../../lib/business-tools';

export default async function handler(req, res) {
  if (!isAuthorizedRequest(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    return handleGetFollowUps(req, res);
  }

  res.status(405).json({ error: 'Method not allowed' });
}

async function handleGetFollowUps(req, res) {
  try {
    const waOrders = await readWaOrders();
    const customOrders = await readCustomOrders();
    const customers = await readCustomers();

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Create customer map for quick lookups
    const customerMap = new Map(
      customers.map(c => [normalizePhone(c.phone), c])
    );

    // 1. Find customers with no response in 24+ hours
    const noResponseCustomers = waOrders
      .filter(order => {
        const orderTime = new Date(order.timestamp);
        const timeSinceOrder = now.getTime() - orderTime.getTime();
        const hoursSinceOrder = timeSinceOrder / (1000 * 60 * 60);
        
        // Order is old enough + status suggests waiting for response
        return hoursSinceOrder >= 24 && 
               (order.status === 'pending' || order.status === 'quoted');
      })
      .map(order => {
        const customer = customerMap.get(normalizePhone(order.phone));
        return {
          type: 'no-response',
          customerName: customer?.name || order.name || 'Unknown',
          phone: order.phone,
          customerPhone: order.phone,
          orderReference: order.orderReference,
          orderTime: order.timestamp,
          hoursSince: Math.round((now.getTime() - new Date(order.timestamp).getTime()) / (1000 * 60 * 60)),
          message: `No response since ${new Date(order.timestamp).toLocaleDateString()}`,
          priority: 'high',
          action: 'follow-up',
          whatsappLink: formatWhatsAppLink(order.phone)
        };
      });

    // 2. Find orders pending deposit payment
    const pendingDeposits = customOrders
      .filter(order => order.status === 'quoted' || order.status === 'awaiting_deposit')
      .map(order => {
        const customer = customerMap.get(normalizePhone(order.phone));
        return {
          type: 'pending-deposit',
          customerName: customer?.name || order.customerName || 'Unknown',
          phone: order.phone,
          customerPhone: order.phone,
          orderReference: order.orderReference,
          depositAmount: order.deposit || order.price || 0,
          orderTime: order.createdAt || new Date().toISOString(),
          daysSince: Math.floor((now.getTime() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
          message: `Deposit of KES ${order.deposit || order.price || 0} pending`,
          priority: order.status === 'quoted' ? 'medium' : 'high',
          action: 'collect-deposit',
          whatsappLink: formatWhatsAppLink(order.phone),
          estimatedCompletion: order.estimatedCompletionDate || null
        };
      });

    // 3. Find orders ready to ship/deliver
    const readyToShip = waOrders
      .filter(order => order.status === 'paid' || order.status === 'ready_to_ship')
      .map(order => {
        const customer = customerMap.get(normalizePhone(order.phone));
        return {
          type: 'ready-to-ship',
          customerName: customer?.name || order.name || 'Unknown',
          phone: order.phone,
          customerPhone: order.phone,
          orderReference: order.orderReference,
          orderTotal: order.total || 0,
          orderTime: order.timestamp,
          daysSinceOrder: Math.floor((now.getTime() - new Date(order.timestamp).getTime()) / (1000 * 60 * 60 * 24)),
          message: `Ready to ship - KES ${order.total || 0}`,
          priority: 'high',
          action: 'ship-delivery',
          whatsappLink: formatWhatsAppLink(order.phone)
        };
      });

    // 4. Find custom orders ready to deliver
    const customOrdersReadyToDeliver = customOrders
      .filter(order => order.status === 'completed' && order.paymentStatus !== 'delivered')
      .map(order => {
        const customer = customerMap.get(normalizePhone(order.phone));
        return {
          type: 'ready-to-deliver',
          customerName: customer?.name || order.customerName || 'Unknown',
          phone: order.phone,
          customerPhone: order.phone,
          orderReference: order.orderReference,
          orderPrice: order.price || 0,
          completedAt: order.completedAt || new Date().toISOString(),
          daysSinceCompleted: Math.floor((now.getTime() - new Date(order.completedAt || new Date()).getTime()) / (1000 * 60 * 60 * 24)),
          message: `Custom order ready to deliver`,
          priority: 'medium',
          action: 'deliver-product',
          whatsappLink: formatWhatsAppLink(order.phone),
          estimatedCompletion: order.estimatedCompletionDate || null
        };
      });

    // Combine all follow-ups and sort by priority
    const allFollowUps = [
      ...noResponseCustomers,
      ...pendingDeposits,
      ...readyToShip,
      ...customOrdersReadyToDeliver
    ];

    // Sort: high priority first, then by most recent
    allFollowUps.sort((a, b) => {
      const priorityMap = { high: 0, medium: 1, low: 2 };
      const priorityDiff = priorityMap[a.priority] - priorityMap[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      const timeA = new Date(a.orderTime).getTime();
      const timeB = new Date(b.orderTime).getTime();
      return timeA - timeB;
    });

    // Group by action type
    const groupedByAction = {
      'follow-up': allFollowUps.filter(f => f.action === 'follow-up'),
      'collect-deposit': allFollowUps.filter(f => f.action === 'collect-deposit'),
      'ship-delivery': allFollowUps.filter(f => f.action === 'ship-delivery'),
      'deliver-product': allFollowUps.filter(f => f.action === 'deliver-product')
    };

    return res.status(200).json({
      allFollowUps,
      groupedByAction,
      summary: {
        noResponse: noResponseCustomers.length,
        pendingDeposits: pendingDeposits.length,
        readyToShip: readyToShip.length,
        readyToDeliver: customOrdersReadyToDeliver.length,
        total: allFollowUps.length
      },
      timestamp: now.toISOString()
    });
  } catch (error) {
    console.error('Follow-up dashboard error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch follow-ups',
      details: error.message 
    });
  }
}

function normalizePhone(phone) {
  if (!phone) return '';
  // Convert to 254 format
  let normalized = phone.trim();
  if (normalized.startsWith('0')) {
    normalized = '254' + normalized.slice(1);
  }
  return normalized;
}

function formatWhatsAppLink(phone) {
  const normalized = normalizePhone(phone);
  if (!normalized) return null;
  return `https://wa.me/${normalized}`;
}
