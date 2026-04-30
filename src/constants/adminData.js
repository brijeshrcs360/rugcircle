export const ADMIN_DEMO_USER = {
  email: 'admin@rugcircle.com',
  password: 'admin123',
}

export const INITIAL_CAMPAIGNS = [
  {
    id: 'cmp-ahm-may',
    name: 'Ahmedabad Studio May Batch',
    location: 'Memnagar Studio',
    date: '2026-05-22',
    time: '11:00 AM',
    price: 4500,
    status: 'Active',
    seats: 20,
    registered: 12,
  },
  {
    id: 'cmp-vad-june',
    name: 'Vadodara Pop-up June',
    location: 'Vadodara',
    date: '2026-06-06',
    time: '03:00 PM',
    price: 5500,
    status: 'Draft',
    seats: 40,
    registered: 0,
  },
  {
    id: 'cmp-val-special',
    name: 'Couple Special',
    location: 'Memnagar Studio',
    date: '2026-06-14',
    time: '04:30 PM',
    price: 6500,
    status: 'Closed',
    seats: 18,
    registered: 18,
  },
]

export const INITIAL_REGISTRATIONS = [
  {
    id: 'reg-001',
    participantName: 'Priya Shah',
    email: 'priya@acme.in',
    phone: '+91 9876543210',
    campaignName: 'Ahmedabad Studio May Batch',
    paymentStatus: 'Paid',
    paymentRefId: 'HDFC992314',
    selectedDesign: 'Floral Wave',
    registrationDate: '2026-04-25',
  },
  {
    id: 'reg-002',
    participantName: 'Rohan Mehta',
    email: 'rohan@acme.in',
    phone: '+91 9900011122',
    campaignName: 'Ahmedabad Studio May Batch',
    paymentStatus: 'Pending',
    paymentRefId: '-',
    selectedDesign: 'Geometric Loop',
    registrationDate: '2026-04-27',
  },
  {
    id: 'reg-003',
    participantName: 'Sneha Patel',
    email: 'sneha@globex.com',
    phone: '+91 9000088888',
    campaignName: 'Couple Special',
    paymentStatus: 'Paid',
    paymentRefId: 'HDFC553842',
    selectedDesign: 'Heart Blend',
    registrationDate: '2026-04-28',
  },
]

