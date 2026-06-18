export const DEFAULT_COMP_SELECTIONS = {
  solarPanel: { 
    label: 'Solar Panel',
    checked: true, 
    type: '400Watts', 
    qty: 6, 
    options: ['430Watts Panels', '430w (Certified Refurbished)', '400Watts', '550watts'] 
  },
  inverters: { 
    label: 'Inverters',
    checked: true, 
    type: '10kva Inverter', 
    qty: 2, 
    options: ['10kva Inverter', '1kva', '7.5kva Inverter', '1.7kva', '12kva Inverter', '6.2kva', '3.7kva', '2.5kva'] 
  },
  batteries: { 
    label: 'Batteries',
    checked: true, 
    type: '220AH Batteries', 
    qty: 3, 
    options: ['5kwh-48v LPBF lithium', '7.5kwh-48v LPBF lithium', '17.5kwh-48v Lithium', '220AH Batteries', '10kwh-48v LPBF Lithium', '15kwh-48v LPBF Lithium'] 
  },
  chargingControllers: { 
    label: 'Charging Controllers',
    checked: true, 
    type: '60amps Charging Controller', 
    qty: 3, 
    options: ['40amps Charging Controller', '60amps Charging Controller', '120amps charge controller', '100amps Charge Controller', '80amps Controller'] 
  },
  panelCable: { 
    label: 'Panel Cable',
    checked: true, 
    type: 'Panel Cable (10mm)/yard', 
    qty: 30, 
    options: ['Panel Cable (10mm)/yard'] 
  },
  panelRack: { 
    label: 'Panel Rack',
    checked: true, 
    type: 'Panel Rack', 
    qty: 5, 
    options: ['Panel Rack'] 
  },
  batteryRack: { 
    label: 'Battery Rack',
    checked: true, 
    type: 'Battery rack', 
    qty: 9, 
    options: ['Battery rack'] 
  }
};

export const DEFAULT_COMPONENT_PRICES: Record<string, number> = {
  '430Watts Panels': 180000,
  '430w (Certified Refurbished)': 130000,
  '400Watts': 150000,
  '550watts': 220000,
  '10kva Inverter': 1250000,
  '1kva': 250000,
  '7.5kva Inverter': 980000,
  '1.7kva': 380000,
  '12kva Inverter': 1650000,
  '6.2kva': 780000,
  '3.7kva': 480000,
  '2.5kva': 340000,
  '5kwh-48v LPBF lithium': 1450000,
  '7.5kwh-48v LPBF lithium': 1950000,
  '17.5kwh-48v Lithium': 3950000,
  '220AH Batteries': 350000,
  '10kwh-48v LPBF Lithium': 2650000,
  '15kwh-48v LPBF Lithium': 3450000,
  '40amps Charging Controller': 95000,
  '60amps Charging Controller': 145000,
  '120amps charge controller': 260000,
  '100amps Charge Controller': 220000,
  '80amps Controller': 180000,
  'Panel Cable (10mm)/yard': 9500,
  'Panel Rack': 45000,
  'Battery rack': 65000
};
