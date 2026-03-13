export interface Flight {
  id: string;
  flightNumber: string;
  airline: string;
  planeName: string;
  modelNumber: string;
  origin: string;
  destination: string;
  airport: 'MKJS' | 'MKJF' | 'MKJP';
  direction: 'inbound' | 'outbound';
  status: 'on-time' | 'delayed' | 'arrived' | 'departed' | 'boarding' | 'cancelled';
  scheduledTime: string;
  gate?: string;
}

export interface Airport {
  code: 'MKJS' | 'MKJF' | 'MKJP';
  name: string;
  shortName: string;
  city: string;
  x: number;
  y: number;
}

export const airports: Airport[] = [
  { code: 'MKJS', name: 'Donald Sangster International Airport', shortName: 'Sangster', city: 'Montego Bay', x: 22, y: 35 },
  { code: 'MKJF', name: 'Ian Fleming International Airport', shortName: 'Ian Fleming', city: 'Ocho Rios', x: 52, y: 28 },
  { code: 'MKJP', name: 'Norman Manley International Airport', shortName: 'Norman Manley', city: 'Kingston', x: 78, y: 72 },
];

export const mockFlights: Flight[] = [
  { id: '1', flightNumber: 'AA2413', airline: 'American Airlines', planeName: 'Spirit of the Caribbean', modelNumber: 'Boeing 737-800', origin: 'Miami (MIA)', destination: 'Montego Bay (MBJ)', airport: 'MKJS', direction: 'inbound', status: 'on-time', scheduledTime: '14:30', gate: 'A3' },
  { id: '2', flightNumber: 'JM0072', airline: 'Caribbean Airlines', planeName: 'Island Breeze', modelNumber: 'Boeing 737 MAX 8', origin: 'Montego Bay (MBJ)', destination: 'Toronto (YYZ)', airport: 'MKJS', direction: 'outbound', status: 'boarding', scheduledTime: '15:00', gate: 'B1' },
  { id: '3', flightNumber: 'BA2263', airline: 'British Airways', planeName: 'Windsor Rose', modelNumber: 'Boeing 777-200ER', origin: 'London (LGW)', destination: 'Kingston (KIN)', airport: 'MKJP', direction: 'inbound', status: 'arrived', scheduledTime: '12:45', gate: 'C2' },
  { id: '4', flightNumber: 'DL449', airline: 'Delta Air Lines', planeName: 'Atlantic Runner', modelNumber: 'Airbus A321neo', origin: 'New York (JFK)', destination: 'Montego Bay (MBJ)', airport: 'MKJS', direction: 'inbound', status: 'delayed', scheduledTime: '16:15', gate: 'A7' },
  { id: '5', flightNumber: 'WJ314', airline: 'WestJet', planeName: 'Northern Light', modelNumber: 'Boeing 737-800', origin: 'Kingston (KIN)', destination: 'Montreal (YUL)', airport: 'MKJP', direction: 'outbound', status: 'departed', scheduledTime: '11:00' },
  { id: '6', flightNumber: 'NK927', airline: 'Spirit Airlines', planeName: 'Yellow Tail', modelNumber: 'Airbus A320neo', origin: 'Fort Lauderdale (FLL)', destination: 'Ocho Rios (OCJ)', airport: 'MKJF', direction: 'inbound', status: 'on-time', scheduledTime: '17:30', gate: '1' },
  { id: '7', flightNumber: 'UA1584', airline: 'United Airlines', planeName: 'Globe Trotter', modelNumber: 'Boeing 757-200', origin: 'Houston (IAH)', destination: 'Kingston (KIN)', airport: 'MKJP', direction: 'inbound', status: 'on-time', scheduledTime: '18:00', gate: 'C5' },
  { id: '8', flightNumber: 'BW602', airline: 'Caribbean Airlines', planeName: 'Tropic Star', modelNumber: 'ATR 72-600', origin: 'Ocho Rios (OCJ)', destination: 'Nassau (NAS)', airport: 'MKJF', direction: 'outbound', status: 'on-time', scheduledTime: '19:15', gate: '2' },
  { id: '9', flightNumber: 'CM428', airline: 'Copa Airlines', planeName: 'Panama Express', modelNumber: 'Boeing 737-800', origin: 'Panama City (PTY)', destination: 'Kingston (KIN)', airport: 'MKJP', direction: 'inbound', status: 'on-time', scheduledTime: '13:20', gate: 'C1' },
  { id: '10', flightNumber: 'JB1801', airline: 'JetBlue', planeName: 'Blue Horizon', modelNumber: 'Airbus A320', origin: 'Montego Bay (MBJ)', destination: 'New York (JFK)', airport: 'MKJS', direction: 'outbound', status: 'boarding', scheduledTime: '14:50', gate: 'B4' },
  { id: '11', flightNumber: 'SW2200', airline: 'Southwest Airlines', planeName: 'Canyon Flyer', modelNumber: 'Boeing 737 MAX 8', origin: 'Baltimore (BWI)', destination: 'Montego Bay (MBJ)', airport: 'MKJS', direction: 'inbound', status: 'delayed', scheduledTime: '20:00' },
  { id: '12', flightNumber: 'AC1960', airline: 'Air Canada', planeName: 'Maple Leaf', modelNumber: 'Boeing 787-9', origin: 'Kingston (KIN)', destination: 'Toronto (YYZ)', airport: 'MKJP', direction: 'outbound', status: 'on-time', scheduledTime: '21:30', gate: 'C8' },
];
