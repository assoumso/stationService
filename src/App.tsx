import React, { useState, useEffect } from 'react';
import { 
  FuelStock, 
  Pump, 
  Tank, 
  Delivery, 
  ShopProduct, 
  ShopSale, 
  CarWashRecord, 
  OilChangeRecord, 
  Employee, 
  Shift, 
  CashRegister, 
  Expense, 
  FuelType, 
  ShopCategory,
  FuelQualityTest,
  JournalRecord,
  JournalConfig,
  ClientAccount,
  CreditTransaction,
  MaintenanceIncident
} from './types';

import { 
  INITIAL_FUEL_STOCKS,
  INITIAL_PUMPS,
  INITIAL_TANKS,
  INITIAL_DELIVERIES,
  INITIAL_SHOP_PRODUCTS,
  INITIAL_SHOP_SALES,
  INITIAL_CAR_WASH_RECORDS,
  INITIAL_OIL_CHANGE_RECORDS,
  INITIAL_EMPLOYEES,
  INITIAL_SHIFTS,
  INITIAL_CASH_REGISTERS,
  INITIAL_EXPENSES,
  INITIAL_QUALITY_TESTS,
  FUEL_PRICES,
  INITIAL_JOURNAL_RECORDS,
  DEFAULT_JOURNAL_CONFIG,
  INITIAL_CLIENT_ACCOUNTS,
  INITIAL_CREDIT_TRANSACTIONS,
  INITIAL_MAINTENANCE_INCIDENTS
} from './mockData';

// Subcomponents
import DashboardView from './components/DashboardView';
import FuelsAndTanksView from './components/FuelsAndTanksView';
import PumpsView from './components/PumpsView';
import FuelQualityView from './components/FuelQualityView';
import BoutiqueView from './components/BoutiqueView';
import ServicesView from './components/ServicesView';
import EmployeesAndTeamsView from './components/EmployeesAndTeamsView';
import CaisseAndDépensesView from './components/CaisseAndDépensesView';
import ClotureView from './components/ClotureView';
import ReportsView from './components/ReportsView';
import JournalView from './components/JournalView';
import CreditsView from './components/CreditsView';
import MaintenanceView from './components/MaintenanceView';
import SettingsView, { FuelPriceConfig } from './components/SettingsView';

// Icons
import { 
  LayoutDashboard, 
  Droplet, 
  Gauge, 
  ShoppingBag, 
  Wrench, 
  Users, 
  Coins, 
  Lock, 
  BarChart2,
  RefreshCw,
  Clock,
  User,
  LogOut,
  Sparkles,
  Menu,
  X,
  FlaskConical,
  Cloud,
  CloudOff,
  Database,
  Check,
  Copy,
  AlertTriangle,
  FileText,
  CheckCircle2,
  CreditCard,
  Settings,
  Info
} from 'lucide-react';

import { 
  supabase, 
  isSupabaseConfigured, 
  saveStateToSupabase, 
  loadStateFromSupabase, 
  testSupabaseConnection 
} from './lib/supabaseClient';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // --- PERSISTENT STATE ENGINGES ---
  const [fuels, setFuels] = useState<FuelStock[]>([]);
  const [pumps, setPumps] = useState<Pump[]>([]);
  const [tanks, setTanks] = useState<Tank[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [shopProducts, setShopProducts] = useState<ShopProduct[]>([]);
  const [shopSales, setShopSales] = useState<ShopSale[]>([]);
  const [carWash, setCarWash] = useState<CarWashRecord[]>([]);
  const [oilChanges, setOilChanges] = useState<OilChangeRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [cashRegisters, setCashRegisters] = useState<CashRegister[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [qualityTests, setQualityTests] = useState<FuelQualityTest[]>([]);
  const [closureStatus, setClosureStatus] = useState<'En cours' | 'Clôturé'>('En cours');
  const [journalRecords, setJournalRecords] = useState<JournalRecord[]>([]);
  const [journalConfig, setJournalConfig] = useState<JournalConfig>({
    col1Title: "Entretien & Dépenses",
    col2Title: "Dépôts & Avance",
    col3Title: "Gazole / Carburant",
    col4Title: "Autres / Péages"
  });
  const [clientAccounts, setClientAccounts] = useState<ClientAccount[]>([]);
  const [creditTransactions, setCreditTransactions] = useState<CreditTransaction[]>([]);
  const [maintenanceIncidents, setMaintenanceIncidents] = useState<MaintenanceIncident[]>([]);
  const [fuelPrices, setFuelPrices] = useState<FuelPriceConfig>(FUEL_PRICES);

  // --- NOTIFICATION STATE ---
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // --- SUPABASE SYNC STATES ---
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);
  const [supabaseStatus, setSupabaseStatus] = useState<{
    connected: boolean;
    schemaExists: boolean;
    error?: string;
    loading: boolean;
  }>({
    connected: false,
    schemaExists: false,
    loading: isSupabaseConfigured()
  });

  const [syncHistory, setSyncHistory] = useState<{
    lastPullTime: string | null;
    lastPushTime: string | null;
    pendingCount: number;
  }>({
    lastPullTime: null,
    lastPushTime: null,
    pendingCount: 0
  });

  const [copiedSql, setCopiedSql] = useState<boolean>(false);

  // Helper to save states to localstorage
  const saveToLocal = (key: string, value: any) => {
    localStorage.setItem(`station_${key}`, JSON.stringify(value));
  };

  // Helper to sync state to Supabase in the background
  const triggerCloudSync = async (key: string, value: any) => {
    if (!isSupabaseConfigured()) return;
    const res = await saveStateToSupabase(key, value);
    if (res.success) {
      setSyncHistory(prev => ({
        ...prev,
        lastPushTime: new Date().toLocaleTimeString('fr-FR')
      }));
    } else {
      console.warn(`Sync failed for ${key}:`, res.error);
    }
  };

  // Pull all states from Supabase (Supabase est la source de vérité)
  const pullFromSupabase = async (
    currentFuels: FuelStock[],
    currentPumps: Pump[],
    currentTanks: Tank[],
    currentDeliveries: Delivery[],
    currentShopProducts: ShopProduct[],
    currentShopSales: ShopSale[],
    currentCarWash: CarWashRecord[],
    currentOilChanges: OilChangeRecord[],
    currentEmployees: Employee[],
    currentShifts: Shift[],
    currentCashRegisters: CashRegister[],
    currentExpenses: Expense[],
    currentQualityTests: FuelQualityTest[],
    currentClosureStatus: 'En cours' | 'Clôturé',
    currentJournalRecords: JournalRecord[],
    currentJournalConfig: JournalConfig,
    currentClientAccounts: ClientAccount[],
    currentCreditTransactions: CreditTransaction[],
    currentMaintenanceIncidents: MaintenanceIncident[],
    currentFuelPrices: FuelPriceConfig
  ) => {
    if (!isSupabaseConfigured()) return;
    setSupabaseStatus(prev => ({ ...prev, loading: true }));
    try {
      const conn = await testSupabaseConnection();
      setSupabaseStatus({
        connected: conn.connected,
        schemaExists: conn.schemaExists,
        error: conn.error,
        loading: false
      });

      if (conn.connected && conn.schemaExists) {
        // 1. Vérifier si station_store a déjà des enregistrements
        //    → si oui, Supabase est la source de vérité, on lit et on met à jour le state local
        //    → si non (installation fraîche), on initialise Supabase avec les données locales
        const { count: existingCount } = await supabase!
          .from('station_store')
          .select('id', { count: 'exact', head: true });

        const isFreshInstall = !existingCount || (existingCount as any) === 0;

        const keys = [
          'fuels', 'pumps', 'tanks', 'deliveries', 'shopProducts', 'shopSales', 
          'carWash', 'oilChanges', 'employees', 'shifts', 'cashRegisters', 
          'expenses', 'qualityTests', 'closureStatus', 'journalRecords', 'journalConfig',
          'clientAccounts', 'creditTransactions', 'maintenanceIncidents', 'fuelPrices'
        ];

        const results = await Promise.all(keys.map(k => loadStateFromSupabase(k)));
        const keysToSeed: { key: string; val: any }[] = [];

        results.forEach((data, index) => {
          const key = keys[index];
          if (data !== null) {
            // ✅ Supabase a des données → mettre à jour le state local (Supabase prime)
            switch (key) {
              case 'fuels': setFuels(data); saveToLocal('fuels', data); break;
              case 'pumps': setPumps(data); saveToLocal('pumps', data); break;
              case 'tanks': setTanks(data); saveToLocal('tanks', data); break;
              case 'deliveries': setDeliveries(data); saveToLocal('deliveries', data); break;
              case 'shopProducts': setShopProducts(data); saveToLocal('shopProducts', data); break;
              case 'shopSales': setShopSales(data); saveToLocal('shopSales', data); break;
              case 'carWash': setCarWash(data); saveToLocal('carWash', data); break;
              case 'oilChanges': setOilChanges(data); saveToLocal('oilChanges', data); break;
              case 'employees': setEmployees(data); saveToLocal('employees', data); break;
              case 'shifts': setShifts(data); saveToLocal('shifts', data); break;
              case 'cashRegisters': setCashRegisters(data); saveToLocal('cashRegisters', data); break;
              case 'expenses': setExpenses(data); saveToLocal('expenses', data); break;
              case 'qualityTests': setQualityTests(data); saveToLocal('qualityTests', data); break;
              case 'closureStatus': setClosureStatus(data); saveToLocal('closureStatus', data); break;
              case 'journalRecords': setJournalRecords(data); saveToLocal('journalRecords', data); break;
              case 'journalConfig': setJournalConfig(data); saveToLocal('journalConfig', data); break;
              case 'clientAccounts': setClientAccounts(data); saveToLocal('clientAccounts', data); break;
              case 'creditTransactions': setCreditTransactions(data); saveToLocal('creditTransactions', data); break;
              case 'maintenanceIncidents': setMaintenanceIncidents(data); saveToLocal('maintenanceIncidents', data); break;
              case 'fuelPrices': setFuelPrices(data); saveToLocal('fuelPrices', data); break;
            }
          } else if (isFreshInstall) {
            // ⚠️ Supabase vide (première installation) → initialiser avec les données locales
            let currentLocalVal: any = null;
            switch (key) {
              case 'fuels': currentLocalVal = currentFuels; break;
              case 'pumps': currentLocalVal = currentPumps; break;
              case 'tanks': currentLocalVal = currentTanks; break;
              case 'deliveries': currentLocalVal = currentDeliveries; break;
              case 'shopProducts': currentLocalVal = currentShopProducts; break;
              case 'shopSales': currentLocalVal = currentShopSales; break;
              case 'carWash': currentLocalVal = currentCarWash; break;
              case 'oilChanges': currentLocalVal = currentOilChanges; break;
              case 'employees': currentLocalVal = currentEmployees; break;
              case 'shifts': currentLocalVal = currentShifts; break;
              case 'cashRegisters': currentLocalVal = currentCashRegisters; break;
              case 'expenses': currentLocalVal = currentExpenses; break;
              case 'qualityTests': currentLocalVal = currentQualityTests; break;
              case 'closureStatus': currentLocalVal = currentClosureStatus; break;
              case 'journalRecords': currentLocalVal = currentJournalRecords; break;
              case 'journalConfig': currentLocalVal = currentJournalConfig; break;
              case 'clientAccounts': currentLocalVal = currentClientAccounts; break;
              case 'creditTransactions': currentLocalVal = currentCreditTransactions; break;
              case 'maintenanceIncidents': currentLocalVal = currentMaintenanceIncidents; break;
              case 'fuelPrices': currentLocalVal = currentFuelPrices; break;
            }
            if (currentLocalVal !== null) {
              keysToSeed.push({ key, val: currentLocalVal });
            }
          }
        });

        // Initialisation Supabase uniquement si c'est une installation fraîche
        if (keysToSeed.length > 0 && isFreshInstall) {
          await Promise.all(keysToSeed.map(item => saveStateToSupabase(item.key, item.val)));
        }

        setSyncHistory({
          lastPullTime: new Date().toLocaleTimeString('fr-FR'),
          lastPushTime: keysToSeed.length > 0 ? new Date().toLocaleTimeString('fr-FR') : null,
          pendingCount: 0
        });
      }
    } catch (err) {
      console.error('Erreur durant la synchronisation initiale:', err);
    } finally {
      setSupabaseStatus(prev => ({ ...prev, loading: false }));
    }
  };

  // Push all local states to Supabase manually
  const pushAllToSupabase = async () => {
    if (!isSupabaseConfigured()) return;
    setSupabaseStatus(prev => ({ ...prev, loading: true }));
    try {
      const keys = [
        'fuels', 'pumps', 'tanks', 'deliveries', 'shopProducts', 'shopSales', 
        'carWash', 'oilChanges', 'employees', 'shifts', 'cashRegisters', 
        'expenses', 'qualityTests', 'closureStatus', 'journalRecords', 'journalConfig',
        'clientAccounts', 'creditTransactions', 'maintenanceIncidents', 'fuelPrices'
      ];
      
      const values = [
        fuels, pumps, tanks, deliveries, shopProducts, shopSales, 
        carWash, oilChanges, employees, shifts, cashRegisters, 
        expenses, qualityTests, closureStatus, journalRecords, journalConfig,
        clientAccounts, creditTransactions, maintenanceIncidents, fuelPrices
      ];

      await Promise.all(keys.map((key, i) => saveStateToSupabase(key, values[i])));

      setSyncHistory(prev => ({
        ...prev,
        lastPushTime: new Date().toLocaleTimeString('fr-FR')
      }));
      window.alert("Toutes les données locales ont été exportées avec succès vers votre base de données Supabase !");
    } catch (err) {
      console.error('Erreur lors de l\'exportation:', err);
      window.alert('Erreur d\'exportation. Veuillez vérifier que vos identifiants et votre schéma SQL sont corrects.');
    } finally {
      setSupabaseStatus(prev => ({ ...prev, loading: false }));
    }
  };

  // Manually refresh connection and schema status
  const refreshSupabaseStatus = async () => {
    setSupabaseStatus(prev => ({ ...prev, loading: true }));
    const conn = await testSupabaseConnection();
    setSupabaseStatus({
      connected: conn.connected,
      schemaExists: conn.schemaExists,
      error: conn.error,
      loading: false
    });
  };

  // --- Initial load & localstorage hooks ---
  useEffect(() => {
    // Helper to read storage or fallback
    const getLocal = <T,>(key: string, fallback: T): T => {
      const data = localStorage.getItem(`station_${key}`);
      return data ? JSON.parse(data) : fallback;
    };

    const initFuels = getLocal('fuels', INITIAL_FUEL_STOCKS);
    const initPumps = getLocal('pumps', INITIAL_PUMPS);
    const initTanks = getLocal('tanks', INITIAL_TANKS);
    const initDeliveries = getLocal('deliveries', INITIAL_DELIVERIES);
    const initShopProducts = getLocal('shopProducts', INITIAL_SHOP_PRODUCTS);
    const initShopSales = getLocal('shopSales', INITIAL_SHOP_SALES);
    const initCarWash = getLocal('carWash', INITIAL_CAR_WASH_RECORDS);
    const initOilChanges = getLocal('oilChanges', INITIAL_OIL_CHANGE_RECORDS);
    const initEmployees = getLocal('employees', INITIAL_EMPLOYEES);
    const initShifts = getLocal('shifts', INITIAL_SHIFTS);
    const initCashRegisters = getLocal('cashRegisters', INITIAL_CASH_REGISTERS);
    const initExpenses = getLocal('expenses', INITIAL_EXPENSES);
    const initQualityTests = getLocal('qualityTests', INITIAL_QUALITY_TESTS);
    const initClosureStatus = getLocal('closureStatus', 'En cours') as 'En cours' | 'Clôturé';
    const initJournalRecords = getLocal('journalRecords', INITIAL_JOURNAL_RECORDS);
    const initJournalConfig = getLocal('journalConfig', DEFAULT_JOURNAL_CONFIG);
    const initClientAccounts = getLocal('clientAccounts', INITIAL_CLIENT_ACCOUNTS);
    const initCreditTransactions = getLocal('creditTransactions', INITIAL_CREDIT_TRANSACTIONS);
    const initMaintenanceIncidents = getLocal('maintenanceIncidents', INITIAL_MAINTENANCE_INCIDENTS);
    const initFuelPrices = getLocal('fuelPrices', FUEL_PRICES);

    setFuels(initFuels);
    setPumps(initPumps);
    setTanks(initTanks);
    setDeliveries(initDeliveries);
    setShopProducts(initShopProducts);
    setShopSales(initShopSales);
    setCarWash(initCarWash);
    setOilChanges(initOilChanges);
    setEmployees(initEmployees);
    setShifts(initShifts);
    setCashRegisters(initCashRegisters);
    setExpenses(initExpenses);
    setQualityTests(initQualityTests);
    setClosureStatus(initClosureStatus);
    setJournalRecords(initJournalRecords);
    setJournalConfig(initJournalConfig);
    setClientAccounts(initClientAccounts);
    setCreditTransactions(initCreditTransactions);
    setMaintenanceIncidents(initMaintenanceIncidents);
    setFuelPrices(initFuelPrices);

    if (isSupabaseConfigured()) {
      pullFromSupabase(
        initFuels, initPumps, initTanks, initDeliveries, initShopProducts, initShopSales,
        initCarWash, initOilChanges, initEmployees, initShifts, initCashRegisters,
        initExpenses, initQualityTests, initClosureStatus, initJournalRecords, initJournalConfig,
        initClientAccounts, initCreditTransactions, initMaintenanceIncidents, initFuelPrices
      );
    }
  }, []);

  // --- Save states on change helpers (centralized for both local & Supabase) ---
  const updateFuelsState = (newFuels: FuelStock[]) => {
    setFuels(newFuels);
    saveToLocal('fuels', newFuels);
    triggerCloudSync('fuels', newFuels);
  };

  const updatePumpsState = (newPumps: Pump[]) => {
    setPumps(newPumps);
    saveToLocal('pumps', newPumps);
    triggerCloudSync('pumps', newPumps);
  };

  const updateTanksState = (newTanks: Tank[]) => {
    setTanks(newTanks);
    saveToLocal('tanks', newTanks);
    triggerCloudSync('tanks', newTanks);
  };

  const updateDeliveriesState = (newDels: Delivery[]) => {
    setDeliveries(newDels);
    saveToLocal('deliveries', newDels);
    triggerCloudSync('deliveries', newDels);
  };

  const updateShopProductsState = (newProds: ShopProduct[]) => {
    setShopProducts(newProds);
    saveToLocal('shopProducts', newProds);
    triggerCloudSync('shopProducts', newProds);
  };

  const updateShopSalesState = (newSales: ShopSale[]) => {
    setShopSales(newSales);
    saveToLocal('shopSales', newSales);
    triggerCloudSync('shopSales', newSales);
  };

  const updateCarWashState = (newWashes: CarWashRecord[]) => {
    setCarWash(newWashes);
    saveToLocal('carWash', newWashes);
    triggerCloudSync('carWash', newWashes);
  };

  const updateOilChangesState = (newOils: OilChangeRecord[]) => {
    setOilChanges(newOils);
    saveToLocal('oilChanges', newOils);
    triggerCloudSync('oilChanges', newOils);
  };

  const updateEmployeesState = (newEmps: Employee[]) => {
    setEmployees(newEmps);
    saveToLocal('employees', newEmps);
    triggerCloudSync('employees', newEmps);
  };

  const updateShiftsState = (newShifts: Shift[]) => {
    setShifts(newShifts);
    saveToLocal('shifts', newShifts);
    triggerCloudSync('shifts', newShifts);
  };

  const updateCashRegistersState = (newRegs: CashRegister[]) => {
    setCashRegisters(newRegs);
    saveToLocal('cashRegisters', newRegs);
    triggerCloudSync('cashRegisters', newRegs);
  };

  const updateExpensesState = (newExps: Expense[]) => {
    setExpenses(newExps);
    saveToLocal('expenses', newExps);
    triggerCloudSync('expenses', newExps);
  };

  const updateQualityTestsState = (newTests: FuelQualityTest[]) => {
    setQualityTests(newTests);
    saveToLocal('qualityTests', newTests);
    triggerCloudSync('qualityTests', newTests);
  };

  const updateClosureStatusState = (status: 'En cours' | 'Clôturé') => {
    setClosureStatus(status);
    saveToLocal('closureStatus', status);
    triggerCloudSync('closureStatus', status);
  };

  const updateJournalRecordsState = (newRecords: JournalRecord[]) => {
    setJournalRecords(newRecords);
    saveToLocal('journalRecords', newRecords);
    triggerCloudSync('journalRecords', newRecords);
  };

  const updateJournalConfigState = (newConfig: JournalConfig) => {
    setJournalConfig(newConfig);
    saveToLocal('journalConfig', newConfig);
    triggerCloudSync('journalConfig', newConfig);
  };

  const updateClientAccountsState = (newAccs: ClientAccount[]) => {
    setClientAccounts(newAccs);
    saveToLocal('clientAccounts', newAccs);
    triggerCloudSync('clientAccounts', newAccs);
  };

  const updateCreditTransactionsState = (newTxs: CreditTransaction[]) => {
    setCreditTransactions(newTxs);
    saveToLocal('creditTransactions', newTxs);
    triggerCloudSync('creditTransactions', newTxs);
  };

  const updateMaintenanceIncidentsState = (newIncs: MaintenanceIncident[]) => {
    setMaintenanceIncidents(newIncs);
    saveToLocal('maintenanceIncidents', newIncs);
    triggerCloudSync('maintenanceIncidents', newIncs);
  };

  const updateFuelPricesState = async (newPrices: FuelPriceConfig) => {
    setFuelPrices(newPrices);
    saveToLocal('fuelPrices', newPrices);
    await triggerCloudSync('fuelPrices', newPrices);
    showNotification("Paramètres de prix sauvegardés et synchronisés !");
  };

  // --- API STATE CONTROLLER ACTIONS ---

  // Reset helper
  const handleResetDemoData = () => {
    const check = window.confirm("Souhaitez-vous recharger les données d'usine de démo ?\nTous les ajustements saisis aujourd'hui seront réinitialisés.");
    if (check) {
      localStorage.clear();
      updateFuelsState(INITIAL_FUEL_STOCKS);
      updatePumpsState(INITIAL_PUMPS);
      updateTanksState(INITIAL_TANKS);
      updateDeliveriesState(INITIAL_DELIVERIES);
      updateShopProductsState(INITIAL_SHOP_PRODUCTS);
      updateShopSalesState(INITIAL_SHOP_SALES);
      updateCarWashState(INITIAL_CAR_WASH_RECORDS);
      updateOilChangesState(INITIAL_OIL_CHANGE_RECORDS);
      updateEmployeesState(INITIAL_EMPLOYEES);
      updateShiftsState(INITIAL_SHIFTS);
      updateCashRegistersState(INITIAL_CASH_REGISTERS);
      updateExpensesState(INITIAL_EXPENSES);
      updateQualityTestsState(INITIAL_QUALITY_TESTS);
      updateClosureStatusState('En cours');
      updateJournalRecordsState(INITIAL_JOURNAL_RECORDS);
      updateJournalConfigState(DEFAULT_JOURNAL_CONFIG);
      updateClientAccountsState(INITIAL_CLIENT_ACCOUNTS);
      updateCreditTransactionsState(INITIAL_CREDIT_TRANSACTIONS);
      updateMaintenanceIncidentsState(INITIAL_MAINTENANCE_INCIDENTS);
      alert("Données d'origine réimportées avec succès !");
      setActiveTab('dashboard');
    }
  };

  // 1. Fuels Stock update
  const handleUpdateFuelRealStock = (id: string, realStock: number) => {
    const updated = fuels.map(f => {
      if (f.id === id) {
        const gap = realStock - f.theoreticalStock;
        return { ...f, realStock, gap, lastUpdated: '2026-06-11' };
      }
      return f;
    });
    updateFuelsState(updated);
    showNotification("Stock de carburant mis à jour !");
  };

  // 2. Tank Stock update
  const handleUpdateTankRealStock = (id: string, realStock: number) => {
    const updated = tanks.map(t => {
      if (t.id === id) {
        const lossDetected = realStock - t.theoreticalStock;
        return { ...t, realDipstickStock: realStock, lossDetected, lastUpdated: '2026-06-11' };
      }
      return t;
    });
    updateTanksState(updated);
    showNotification("Jaugeage de la cuve enregistré !");
  };

  // 3. Register Delivery
  const handleAddDelivery = (deliveryOmit: Omit<Delivery, 'id' | 'totalAmount'>) => {
    const amountVal = deliveryOmit.quantity * deliveryOmit.purchasePricePerLiter;
    const newDelivery: Delivery = {
      ...deliveryOmit,
      id: `del_${Date.now()}`,
      totalAmount: amountVal
    };

    // Add to list
    const updatedDels = [newDelivery, ...deliveries];
    updateDeliveriesState(updatedDels);
    showNotification("Livraison enregistrée avec succès !");

    // Update fuel entries stock
    const updatedFuels = fuels.map(f => {
      if (f.product === deliveryOmit.product) {
        const inputs = f.inputs + deliveryOmit.quantity;
        const theoreticalStock = f.initialStock + inputs - f.outputs;
        const gap = f.realStock - theoreticalStock;
        return { ...f, inputs, theoreticalStock, gap };
      }
      return f;
    });
    updateFuelsState(updatedFuels);

    // Update Tank deliveries stock
    const updatedTanks = tanks.map(t => {
      if (t.fuelType === deliveryOmit.product) {
        const dels = t.deliveries + deliveryOmit.quantity;
        const theoreticalStock = t.initialStock + dels - t.sales;
        const lossDetected = t.realDipstickStock - theoreticalStock;
        return { ...t, deliveries: dels, theoreticalStock, lossDetected };
      }
      return t;
    });
    updateTanksState(updatedTanks);
  };

  // 4. Update Pump readings Index
  const handleUpdatePumpIndices = (id: string, startIndex: number, endIndex: number) => {
    const originalPump = pumps.find(p => p.id === id);
    if (!originalPump) return;

    const volumeSold = endIndex - startIndex;
    const previousVolume = originalPump.volumeSold;
    const volumeDifference = volumeSold - previousVolume;

    // A. Update Pump Record
    const updatedPumps = pumps.map(p => {
      if (p.id === id) {
        return { ...p, startIndex, endIndex, volumeSold, lastUpdated: '2026-06-11' };
      }
      return p;
    });
    updatePumpsState(updatedPumps);

    // B. Recompute matching Fuel product outputs
    const pumpTarget = originalPump.fuelType;
    const sameFuelPumps = updatedPumps.filter(p => p.fuelType === pumpTarget);
    const totalFuelOut = sameFuelPumps.reduce((acc, p) => acc + p.volumeSold, 0);

    const updatedFuels = fuels.map(f => {
      if (f.product === pumpTarget) {
        const outputs = totalFuelOut;
        const theoreticalStock = f.initialStock + f.inputs - outputs;
        const gap = f.realStock - theoreticalStock;
        return { ...f, outputs, theoreticalStock, gap };
      }
      return f;
    });
    updateFuelsState(updatedFuels);

    // C. Recompute Tank sales
    const updatedTanks = tanks.map(t => {
      if (t.fuelType === pumpTarget) {
        const sales = totalFuelOut; // assume this tank supplies these pumps
        const theoreticalStock = t.initialStock + t.deliveries - sales;
        const lossDetected = t.realDipstickStock - theoreticalStock;
        return { ...t, sales, theoreticalStock, lossDetected };
      }
      return t;
    });
    updateTanksState(updatedTanks);

    // D. Adjust active shift & cash registers balance with the delta
    const fuelPrice = fuelPrices[pumpTarget]?.sell || 0;
    const deltaAmount = volumeDifference * fuelPrice;

    // Increase theoretical invoice cash of the active shift (s2: Soir is our active)
    const updatedShifts = shifts.map(s => {
      if (s.id === 's2') {
        const cashInvoiced = s.cashInvoiced + deltaAmount;
        return { ...s, cashInvoiced };
      }
      return s;
    });
    updateShiftsState(updatedShifts);

    // Increase Cash Balance registers
    const updatedCash = cashRegisters.map(cr => {
      if (cr.method === 'Espèces') {
        return { ...cr, currentBalance: cr.currentBalance + deltaAmount };
      }
      return cr;
    });
    updateCashRegistersState(updatedCash);
  };

  // 5. Add a pump config
  const handleAddPump = (pumpOmit: Omit<Pump, 'id' | 'volumeSold' | 'lastUpdated'>) => {
    const newPump: Pump = {
      ...pumpOmit,
      id: `pump_${Date.now()}`,
      volumeSold: 0,
      lastUpdated: '2026-06-11'
    };
    const updated = [...pumps, newPump];
    updatePumpsState(updated);
    showNotification("Nouvelle pompe configurée et activée !");
  };

  const handleDeletePump = (id: string) => {
    const confirmDelete = window.confirm("Êtes-vous sûr de vouloir supprimer cette pompe/index ?");
    if (confirmDelete) {
      const updated = pumps.filter(p => p.id !== id);
      updatePumpsState(updated);
      showNotification("Pompe supprimée.", "info");
    }
  };

  const handleUpdatePumpConfig = (id: string, config: { name: string; fuelType: FuelType; nozzlesCount: number }) => {
    const updated = pumps.map(p => {
      if (p.id === id) {
        return {
          ...p,
          name: config.name,
          fuelType: config.fuelType,
          nozzlesCount: config.nozzlesCount
        };
      }
      return p;
    });
    updatePumpsState(updated);
    showNotification("Configuration de la pompe mise à jour !");
  };

  // 6. Sell product in Shop (Boutique)
  const handleSellProduct = (productId: string, quantity: number) => {
    const targetProd = shopProducts.find(p => p.id === productId);
    if (!targetProd) return;

    // A. Update metrics for product
    const updatedProducts = shopProducts.map(p => {
      if (p.id === productId) {
        const stock = p.stock - quantity;
        const salesCount = p.salesCount + quantity;
        const totalRevenue = salesCount * p.sellingPrice;
        return { ...p, stock, salesCount, totalRevenue };
      }
      return p;
    });
    updateShopProductsState(updatedProducts);

    // B. Build Shop sale transaction log
    const amountEarned = targetProd.sellingPrice * quantity;
    const newSale: ShopSale = {
      id: `sale_${Date.now()}`,
      productId,
      productName: targetProd.name,
      quantity,
      price: targetProd.sellingPrice,
      total: amountEarned,
      date: new Date().toISOString()
    };
    const updatedSales = [newSale, ...shopSales];
    updateShopSalesState(updatedSales);

    // C. Feed into Cash and Shift
    const updatedCash = cashRegisters.map(cr => {
      if (cr.method === 'Espèces') {
        return { ...cr, currentBalance: cr.currentBalance + amountEarned };
      }
      return cr;
    });
    updateCashRegistersState(updatedCash);

    const updatedShifts = shifts.map(s => {
      if (s.id === 's2') {
        return { ...s, cashInvoiced: s.cashInvoiced + amountEarned };
      }
      return s;
    });
    updateShiftsState(updatedShifts);
    showNotification("Vente boutique enregistrée !");
  };

  // 7. Restock Shop product
  const handleRestockProduct = (productId: string, quantity: number) => {
    const updatedProducts = shopProducts.map(p => {
      if (p.id === productId) {
        return { ...p, stock: p.stock + quantity };
      }
      return p;
    });
    updateShopProductsState(updatedProducts);
  };

  // 8. Physical Inventory update
  const handleUpdateShopProductStock = (productId: string, actualStock: number) => {
    const updatedProducts = shopProducts.map(p => {
      if (p.id === productId) {
        return { ...p, stock: actualStock };
      }
      return p;
    });
    updateShopProductsState(updatedProducts);
  };

  // 9. Add Car Wash record
  const handleAddCarWash = (recordOmit: Omit<CarWashRecord, 'id' | 'revenue'>) => {
    const rev = recordOmit.quantity * recordOmit.pricePerWash;
    const newRecord: CarWashRecord = {
      ...recordOmit,
      id: `wash_${Date.now()}`,
      revenue: rev
    };
    
    const updated = [newRecord, ...carWash];
    updateCarWashState(updated);

    // Feed Cash
    const updatedCash = cashRegisters.map(cr => {
      if (cr.method === 'Espèces') {
        return { ...cr, currentBalance: cr.currentBalance + rev };
      }
      return cr;
    });
    updateCashRegistersState(updatedCash);

    // active shift
    const updatedShifts = shifts.map(s => {
      if (s.id === 's2') {
        return { ...s, cashInvoiced: s.cashInvoiced + rev };
      }
      return s;
    });
    updateShiftsState(updatedShifts);
    showNotification("Lavage enregistré et encaissé !");
  };

  // 10. Add Oil Change (Vidange) Record
  const handleAddOilChange = (recordOmit: Omit<OilChangeRecord, 'id' | 'totalCost' | 'margin'>) => {
    const totalCost = recordOmit.oilCost + recordOmit.filterCost + recordOmit.laborCost;
    const margin = recordOmit.chargedPrice - totalCost;
    
    const newRecord: OilChangeRecord = {
      ...recordOmit,
      id: `oil_${Date.now()}`,
      totalCost,
      margin
    };

    const updated = [newRecord, ...oilChanges];
    updateOilChangesState(updated);

    // Feed Cash
    const updatedCash = cashRegisters.map(cr => {
      if (cr.method === 'Espèces') {
        return { ...cr, currentBalance: cr.currentBalance + recordOmit.chargedPrice };
      }
      return cr;
    });
    updateCashRegistersState(updatedCash);

    // Shift
    const updatedShifts = shifts.map(s => {
      if (s.id === 's2') {
        return { ...s, cashInvoiced: s.cashInvoiced + recordOmit.chargedPrice };
      }
      return s;
    });
    updateShiftsState(updatedShifts);
    showNotification("Vidange enregistrée !");
  };

  // 11. Toggle employee presence
  const handleTogglePresence = (id: string) => {
    const updated = employees.map(e => {
      if (e.id === id) {
        return { ...e, isPresent: !e.isPresent, lastActive: '2026-06-11' };
      }
      return e;
    });
    updateEmployeesState(updated);
  };

  // 12. Add custom bonus commissions
  const handleUpdateCommission = (id: string, amount: number) => {
    const updated = employees.map(e => {
      if (e.id === id) {
        return { ...e, commissionsAccumulated: e.commissionsAccumulated + amount };
      }
      return e;
    });
    updateEmployeesState(updated);
  };

  // 13. Close Team Shift
  const handleCloseShift = (id: string, cashReceived: number) => {
    const updated = shifts.map(s => {
      if (s.id === id) {
        const gap = cashReceived - s.cashInvoiced;
        return { ...s, cashReceived, gap, status: 'Clos' as const };
      }
      return s;
    });
    updateShiftsState(updated);

    // Balance in Cash Register Espèces matches cashReceived for closed shift
    // This is handled visually for direct simulation
  };

  // 14. Expense request registration
  const handleAddExpense = (expenseOmit: Omit<Expense, 'id' | 'status'>) => {
    const newExpense: Expense = {
      ...expenseOmit,
      id: `exp_${Date.now()}`,
      status: 'En attente'
    };

    const updated = [newExpense, ...expenses];
    updateExpensesState(updated);
    showNotification("Dépense soumise pour approbation !", "info");
  };

  // 15. Approve Expense (actually pays from cash method)
  const handleApproveExpense = (id: string) => {
    const expObj = expenses.find(e => e.id === id);
    if (!expObj) return;

    // Approved status save
    const updatedExps = expenses.map(e => {
      if (e.id === id) {
        return { ...e, status: 'Approuvé' as const, approvedBy: 'Jean-Marc Koffi' };
      }
      return e;
    });
    updateExpensesState(updatedExps);

    // Deduct from Espèces register balance
    const updatedCash = cashRegisters.map(cr => {
      if (cr.method === 'Espèces') {
        const currentBalance = cr.currentBalance - expObj.amount;
        return { ...cr, currentBalance };
      }
      return cr;
    });
    updateCashRegistersState(updatedCash);
    showNotification("Dépense approuvée et déduite de la caisse !");
  };

  // 16. Reject Expense Voucher
  const handleRejectExpense = (id: string) => {
    const updatedExps = expenses.map(e => {
      if (e.id === id) {
        return { ...e, status: 'Rejeté' as const };
      }
      return e;
    });
    updateExpensesState(updatedExps);
    showNotification("Dépense rejetée.", "error");
  };

  // 17. Live closing execution
  const handleFinalizeDailyClosure = () => {
    updateClosureStatusState('Clôturé');
  };

  // 18. Add quality control test
  const handleAddQualityTest = (testOmit: Omit<FuelQualityTest, 'id' | 'isConform'>) => {
    const helpR = testOmit.fuelType === 'Super' || testOmit.fuelType === 'Sans plomb'
      ? { min: 0.720, max: 0.775 }
      : testOmit.fuelType === 'Gasoil'
      ? { min: 0.820, max: 0.845 }
      : { min: 0.700, max: 0.900 };

    const isDensityConform = testOmit.density >= helpR.min && testOmit.density <= helpR.max;
    const isConform = isDensityConform && !testOmit.waterPresence && Math.abs(testOmit.nozzleAccuracyPercent) <= 0.5;

    const newTest: FuelQualityTest = {
      ...testOmit,
      id: `qt_${Date.now()}`,
      isConform
    };

    const updated = [newTest, ...qualityTests];
    updateQualityTestsState(updated);
    showNotification("Test de qualité enregistré !");
  };

  // 19. Delete quality control test
  const handleDeleteQualityTest = (id: string) => {
    const updated = qualityTests.filter(q => q.id !== id);
    updateQualityTestsState(updated);
  };

  // 20. Action Handlers for Journal
  const handleAddJournalRecord = (record: JournalRecord) => {
    updateJournalRecordsState([record, ...journalRecords]);
  };

  const handleUpdateJournalRecord = (record: JournalRecord) => {
    const updated = journalRecords.map(r => r.id === record.id ? record : r);
    updateJournalRecordsState(updated);
  };

  const handleDeleteJournalRecord = (id: string) => {
    const updated = journalRecords.filter(r => r.id !== id);
    updateJournalRecordsState(updated);
  };

  const handleUpdateJournalConfig = (newConfig: JournalConfig) => {
    updateJournalConfigState(newConfig);
  };

  // 21. Action Handlers for Credits B2B & Accounts
  const handleAddClientAccount = (account: ClientAccount) => {
    updateClientAccountsState([...clientAccounts, account]);
    showNotification("Nouveau compte client B2B créé !");
  };

  const handleDeleteClientAccount = (id: string) => {
    const updated = clientAccounts.filter(c => c.id !== id);
    updateClientAccountsState(updated);
    
    // Cascading delete the associated transactions as well to avoid inconsistency
    const updatedTxs = creditTransactions.filter(t => t.clientId !== id);
    updateCreditTransactionsState(updatedTxs);
  };

  const handleAddCreditTransaction = (tx: CreditTransaction) => {
    // 1. Appended new transaction
    updateCreditTransactionsState([tx, ...creditTransactions]);
    showNotification("Transaction de crédit enregistrée !");

    // 2. Adjust client account balance (totalCreditDetails) in real-time
    const updatedAccounts = clientAccounts.map(cl => {
      if (cl.id === tx.clientId) {
        const diff = tx.type === 'Achat Crédit' ? tx.amount : -tx.amount;
        return {
          ...cl,
          totalCreditDetails: cl.totalCreditDetails + diff,
          lastOperationDate: tx.date
        };
      }
      return cl;
    });
    updateClientAccountsState(updatedAccounts);
    
    // 3. For payments: generate a cash receipt and balance it out with the actual registers as an offset / input
    if (tx.type === 'Règlement / Paiement') {
      const paymentMethodMapped: string = tx.paymentMethod || 'Espèces';
      const updatedRegisters = cashRegisters.map(register => {
        // Adjust the specified register balance
        if (register.method === paymentMethodMapped) {
          return {
            ...register,
            currentBalance: register.currentBalance + tx.amount
          };
        }
        return register;
      });
      updateCashRegistersState(updatedRegisters);
    }
  };

  const handleDeleteCreditTransaction = (id: string) => {
    const txToDelete = creditTransactions.find(t => t.id === id);
    if (!txToDelete) return;

    // 1. Remove transaction
    const updatedTxs = creditTransactions.filter(t => t.id !== id);
    updateCreditTransactionsState(updatedTxs);

    // 2. Re-adjust and correct client accounts balance
    const updatedAccounts = clientAccounts.map(cl => {
      if (cl.id === txToDelete.clientId) {
        // Subtract or add in reverse
        const diff = txToDelete.type === 'Achat Crédit' ? -txToDelete.amount : txToDelete.amount;
        return {
          ...cl,
          totalCreditDetails: Math.max(0, cl.totalCreditDetails + diff)
        };
      }
      return cl;
    });
    updateClientAccountsState(updatedAccounts);

    // 3. If it is high-level payment, reverse from registers
    if (txToDelete.type === 'Règlement / Paiement') {
      const paymentMethodMapped = txToDelete.paymentMethod || 'Espèces';
      const updatedRegisters = cashRegisters.map(register => {
        if (register.method === paymentMethodMapped) {
          return {
            ...register,
            currentBalance: Math.max(0, register.currentBalance - txToDelete.amount)
          };
        }
        return register;
      });
      updateCashRegistersState(updatedRegisters);
    }
  };

  // 22. Action Handlers for Maintenance & Incidents
  const handleAddMaintenanceIncident = (inc: MaintenanceIncident) => {
    const updated = [inc, ...maintenanceIncidents];
    updateMaintenanceIncidentsState(updated);
    showNotification("Incident de maintenance enregistré !");
  };

  const handleUpdateMaintenanceIncident = (inc: MaintenanceIncident) => {
    const updated = maintenanceIncidents.map(i => i.id === inc.id ? inc : i);
    updateMaintenanceIncidentsState(updated);

    // If an incident has custom expenses related (resolved with non-zero cost), auto-log it under station expense sheets in real-time
    if (inc.status === 'Résolu' && inc.cost > 0) {
      // Auto-log cost
      const autoExpense: Expense = {
        id: `exp_m_${inc.id}_${Date.now()}`,
        requestedBy: 'Gérant (Maintenance)',
        amount: inc.cost,
        category: 'Entretien',
        description: `Résolution panne : ${inc.deviceName}. ${inc.description.slice(0, 50)}...`,
        status: 'Approuvé',
        date: inc.resolvedDate || new Date().toISOString().split('T')[0]
      };
      
      const updatedExps = [autoExpense, ...expenses];
      updateExpensesState(updatedExps);

      // Deduct from Espèces register balance like any standard expense approval
      const updatedCash = cashRegisters.map(cr => {
        if (cr.method === 'Espèces') {
          return { ...cr, currentBalance: Math.max(0, cr.currentBalance - inc.cost) };
        }
        return cr;
      });
      updateCashRegistersState(updatedCash);
    }
  };

  const handleDeleteMaintenanceIncident = (id: string) => {
    const updated = maintenanceIncidents.filter(i => i.id !== id);
    updateMaintenanceIncidentsState(updated);
  };

  // Navigation router selector
  const renderCurrentView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView 
            fuels={fuels}
            pumps={pumps}
            tanks={tanks}
            shopProducts={shopProducts}
            carWash={carWash}
            oilChanges={oilChanges}
            expenses={expenses}
            cashRegisters={cashRegisters}
            fuelPrices={fuelPrices}
            onNavigate={(view) => setActiveTab(view)}
          />
        );
      case 'fuels':
        return (
          <FuelsAndTanksView 
            fuels={fuels}
            tanks={tanks}
            deliveries={deliveries}
            fuelPrices={fuelPrices}
            onUpdateFuelRealStock={handleUpdateFuelRealStock}
            onUpdateTankRealStock={handleUpdateTankRealStock}
            onAddDelivery={handleAddDelivery}
          />
        );
      case 'quality':
        return (
          <FuelQualityView 
            tanks={tanks}
            qualityTests={qualityTests}
            onAddQualityTest={handleAddQualityTest}
            onDeleteQualityTest={handleDeleteQualityTest}
          />
        );
      case 'pumps':
        return (
          <PumpsView 
            pumps={pumps}
            fuelPrices={fuelPrices}
            onUpdatePumpIndices={handleUpdatePumpIndices}
            onAddPump={handleAddPump}
            onDeletePump={handleDeletePump}
            onUpdatePumpConfig={handleUpdatePumpConfig}
          />
        );
      case 'boutique':
        return (
          <BoutiqueView 
            products={shopProducts}
            sales={shopSales}
            onSellProduct={handleSellProduct}
            onRestockProduct={handleRestockProduct}
            onUpdateShopProductStock={handleUpdateShopProductStock}
          />
        );
      case 'services':
        return (
          <ServicesView 
            carWash={carWash}
            oilChanges={oilChanges}
            onAddCarWash={handleAddCarWash}
            onAddOilChange={handleAddOilChange}
          />
        );
      case 'employees':
        return (
          <EmployeesAndTeamsView 
            employees={employees}
            shifts={shifts}
            onTogglePresence={handleTogglePresence}
            onUpdateCommission={handleUpdateCommission}
            onCloseShift={handleCloseShift}
          />
        );
      case 'caisse':
        return (
          <CaisseAndDépensesView 
            cashRegisters={cashRegisters}
            expenses={expenses}
            onAddExpense={handleAddExpense}
            onApproveExpense={handleApproveExpense}
            onRejectExpense={handleRejectExpense}
          />
        );
      case 'cloture':
        return (
          <ClotureView 
            fuels={fuels}
            pumps={pumps}
            tanks={tanks}
            shopProducts={shopProducts}
            carWash={carWash}
            oilChanges={oilChanges}
            expenses={expenses}
            cashRegisters={cashRegisters}
            fuelPrices={fuelPrices}
            onFinalizeDailyClosure={handleFinalizeDailyClosure}
            closureStatus={closureStatus}
          />
        );
      case 'journal':
        return (
          <JournalView 
            records={journalRecords}
            config={journalConfig}
            employees={employees}
            onAddRecord={handleAddJournalRecord}
            onUpdateRecord={handleUpdateJournalRecord}
            onDeleteRecord={handleDeleteJournalRecord}
            onUpdateConfig={handleUpdateJournalConfig}
          />
        );
      case 'reports':
        return (
          <ReportsView />
        );
      case 'credits':
        return (
          <CreditsView 
            accounts={clientAccounts}
            transactions={creditTransactions}
            onAddAccount={handleAddClientAccount}
            onDeleteAccount={handleDeleteClientAccount}
            onAddTransaction={handleAddCreditTransaction}
            onDeleteTransaction={handleDeleteCreditTransaction}
          />
        );
      case 'maintenance':
        return (
          <MaintenanceView 
            incidents={maintenanceIncidents}
            onAddIncident={handleAddMaintenanceIncident}
            onUpdateIncident={handleUpdateMaintenanceIncident}
            onDeleteIncident={handleDeleteMaintenanceIncident}
          />
        );
      case 'settings':
        return (
          <SettingsView
            fuelPrices={fuelPrices}
            onSaveFuelPrices={updateFuelPricesState}
          />
        );
      default:
        return <div className="p-8 text-center text-slate-500">Vue non disponible</div>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex" id="app-layout">
      
      {/* Global Notification Toast */}
      {notification && (
        <div className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 px-4 py-3 rounded-lg shadow-xl z-50 text-white text-sm font-semibold flex items-center gap-2 animate-in slide-in-from-bottom-5 fade-in duration-300 ${
          notification.type === 'success' ? 'bg-emerald-600' : 
          notification.type === 'error' ? 'bg-red-600' : 'bg-blue-600'
        }`}>
          {notification.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
          {notification.type === 'error' && <AlertTriangle className="w-5 h-5" />}
          {notification.type === 'info' && <Info className="w-5 h-5" />}
          {notification.message}
        </div>
      )}

      {/* 1. SIDEBAR NAVIGATION - DESKTOP RAIL */}
      <aside className="hidden lg:flex flex-col bg-slate-900 text-slate-300 w-56 shrink-0 border-r border-slate-800" id="aside-navbar">
        {/* Branding header */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-2 bg-slate-900">
          <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center text-white font-bold">
            <Droplet className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-white text-sm uppercase tracking-wider italic leading-none">Station Barakat</h1>
            <span className="text-[9px] text-orange-400 font-mono font-bold tracking-widest mt-0.5 block">JEAN-MARC KOFFI</span>
          </div>
        </div>

        {/* Navigation list by rubric/category */}
        <nav className="flex-1 py-3 space-y-4 overflow-y-auto" id="classified-navigation">
          {[
            {
              category: "Activité & Pilotage",
              headerClass: "text-sky-400 bg-sky-950/20 border-l-2 border-sky-500/60",
              btnActive: "bg-slate-800/80 text-white border-r-4 border-sky-400",
              iconColor: "text-sky-400",
              items: [
                { id: 'dashboard', label: 'Tableau de bord', icon: <LayoutDashboard className="w-4 h-4" /> },
                { id: 'reports', label: 'Analyses & Graphiques', icon: <BarChart2 className="w-4 h-4" /> },
              ]
            },
            {
              category: "Opérations Carburant",
              headerClass: "text-amber-400 bg-amber-950/20 border-l-2 border-amber-500/60",
              btnActive: "bg-slate-800/80 text-white border-r-4 border-amber-400",
              iconColor: "text-amber-400",
              items: [
                { id: 'fuels', label: 'Carburants & Cuves', icon: <Droplet className="w-4 h-4" /> },
                { id: 'pumps', label: 'Index & Pompes', icon: <Gauge className="w-4 h-4" /> },
                { id: 'quality', label: 'Contrôles Qualité & Eau', icon: <FlaskConical className="w-4 h-4" /> },
              ]
            },
            {
              category: "Boutique & Services",
              headerClass: "text-emerald-400 bg-emerald-950/20 border-l-2 border-emerald-500/60",
              btnActive: "bg-slate-800/80 text-white border-r-4 border-emerald-400",
              iconColor: "text-emerald-400",
              items: [
                { id: 'boutique', label: 'Boutique (Shop)', icon: <ShoppingBag className="w-4 h-4" /> },
                { id: 'services', label: 'Lavage & Vidange', icon: <Wrench className="w-4 h-4" /> },
              ]
            },
            {
              category: "Finance & Clôture",
              headerClass: "text-rose-400 bg-rose-950/20 border-l-2 border-rose-500/60",
              btnActive: "bg-slate-800/80 text-white border-r-4 border-rose-400",
              iconColor: "text-rose-400",
              items: [
                { id: 'caisse', label: 'Caisse & Dépenses', icon: <Coins className="w-4 h-4" /> },
                { id: 'journal', label: 'Journal de Station', icon: <FileText className="w-4 h-4" /> },
                { id: 'cloture', label: 'Clôture de Jour', icon: <Lock className="w-4 h-4" /> },
              ]
            },
            {
              category: "Ressources Humaines",
              headerClass: "text-purple-400 bg-purple-950/20 border-l-2 border-purple-500/60",
              btnActive: "bg-slate-800/80 text-white border-r-4 border-purple-400",
              iconColor: "text-purple-400",
              items: [
                { id: 'employees', label: 'Personnel & Shifts', icon: <Users className="w-4 h-4" /> },
              ]
            },
            {
              category: "Logistique & Gérance (Pro)",
              headerClass: "text-amber-500 bg-amber-950/25 border-l-2 border-amber-600/70",
              btnActive: "bg-slate-800/80 text-white border-r-4 border-amber-500",
              iconColor: "text-amber-400",
              items: [
                { id: 'credits', label: 'Crédits Clients B2B', icon: <CreditCard className="w-4 h-4" /> },
                { id: 'maintenance', label: 'Maintenance & Pannes', icon: <Wrench className="w-4 h-4" /> },
                { id: 'settings', label: 'Paramètres Prix', icon: <Settings className="w-4 h-4" /> },
              ]
            }
          ].map((rubric, idx) => (
            <div key={idx} className="space-y-0.5">
              <div className={`px-4 py-1 text-[9px] font-extrabold uppercase tracking-widest ${rubric.headerClass}`}>
                {rubric.category}
              </div>
              {rubric.items.map(navItem => {
                const isSel = activeTab === navItem.id;
                return (
                  <button
                    key={navItem.id}
                    type="button"
                    onClick={() => setActiveTab(navItem.id)}
                    className={`w-full flex items-center gap-3 px-4 py-1.5 text-xs font-semibold transition-all ${
                      isSel 
                        ? rubric.btnActive 
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span className={isSel ? rubric.iconColor : 'text-slate-400'}>
                      {navItem.icon}
                    </span>
                    <span>{navItem.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom controls / reset */}
        <div className="p-4 border-t border-slate-800 space-y-2 bg-slate-950">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-orange-400">
              JK
            </div>
            <div className="text-[10px]">
              <p className="font-bold text-white leading-none">Jean-Marc K.</p>
              <p className="text-slate-500 mt-0.5 font-medium leading-none">Administrateur</p>
            </div>
          </div>

          {/* Supabase connection status widget */}
          <button
            type="button"
            onClick={() => {
              setIsSyncModalOpen(true);
              refreshSupabaseStatus();
            }}
            className="w-full text-left py-1.5 px-1.5 rounded hover:bg-slate-850 text-[10px] font-bold uppercase tracking-wider flex items-center justify-between transition-all border border-slate-800/60 bg-slate-900/40"
          >
            <div className="flex items-center gap-1.5">
              {supabaseStatus.connected ? (
                supabaseStatus.schemaExists ? (
                  <Cloud className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 animate-bounce" />
                )
              ) : (
                <CloudOff className="w-3.5 h-3.5 text-slate-500" />
              )}
              <span className="text-slate-300">Synchro Cloud</span>
            </div>
            <span className={`text-[8px] px-1 rounded-sm font-extrabold ${
              supabaseStatus.connected 
                ? supabaseStatus.schemaExists 
                  ? 'bg-emerald-950 text-emerald-400' 
                  : 'bg-amber-950 text-amber-400' 
                : 'bg-slate-900 text-slate-505 text-slate-500'
            }`}>
              {supabaseStatus.connected 
                ? supabaseStatus.schemaExists 
                  ? 'En ligne' 
                  : 'Schéma absent' 
                : 'Inactif'}
            </span>
          </button>
          
          <button
            type="button"
            onClick={handleResetDemoData}
            className="w-full text-left py-1 px-1.5 rounded hover:bg-slate-850 text-[9px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3 h-3 text-orange-500" /> Réinitialiser Démo
          </button>
        </div>
      </aside>

      {/* 2. MOBILE HEADER & NAVIGATION MENU */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between shadow border-b border-slate-800" id="mobile-header">
          <div className="flex items-center gap-2">
            <Droplet className="w-4 h-4 text-orange-500" />
            <span className="font-extrabold text-sm tracking-wide uppercase italic">Station Barakat</span>
          </div>

          <div className="flex items-center gap-3">
            <button 
              type="button"
              onClick={() => {
                setIsSyncModalOpen(true);
                refreshSupabaseStatus();
              }}
              className="p-1.5 text-slate-400 hover:text-white"
              title="Statut de Synchronisation"
            >
              {supabaseStatus.connected ? (
                supabaseStatus.schemaExists ? (
                  <Cloud className="w-4.5 h-4.5 text-emerald-500 animate-pulse" />
                ) : (
                  <AlertTriangle className="w-4.5 h-4.5 text-amber-500 animate-bounce" />
                )
              ) : (
                <CloudOff className="w-4.5 h-4.5 text-slate-500" />
              )}
            </button>

            <button 
              type="button"
              onClick={handleResetDemoData} 
              className="p-1 text-slate-400 hover:text-white"
              title="Reset data"
            >
              <RefreshCw className="w-4 h-4 text-orange-500" />
            </button>
            <button 
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="p-1 text-slate-300 hover:text-white"
              title="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </header>

        {/* Mobile menu Overlay drawer with rubrics */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-slate-950 text-slate-200 border-b border-slate-800 transition-all shadow-md z-45" id="mobile-menu-drawer">
            <nav className="p-3 space-y-3">
              {[
                {
                  category: "Activité & Pilotage",
                  headerClass: "text-sky-400 bg-sky-950/20 border-l-2 border-sky-500/60",
                  btnActive: "bg-slate-800/80 text-white border-l-4 border-sky-400",
                  iconColor: "text-sky-450 text-sky-400",
                  items: [
                    { id: 'dashboard', label: 'Tableau de bord', icon: <LayoutDashboard className="w-4 h-4" /> },
                    { id: 'reports', label: 'Analyses & Graphiques', icon: <BarChart2 className="w-4 h-4" /> },
                  ]
                },
                {
                  category: "Opérations Carburant",
                  headerClass: "text-amber-400 bg-amber-950/20 border-l-2 border-amber-500/60",
                  btnActive: "bg-slate-800/80 text-white border-l-4 border-amber-400",
                  iconColor: "text-amber-450 text-amber-400",
                  items: [
                    { id: 'fuels', label: 'Carburants & Cuves', icon: <Droplet className="w-4 h-4" /> },
                    { id: 'pumps', label: 'Index & Pompes', icon: <Gauge className="w-4 h-4" /> },
                    { id: 'quality', label: 'Contrôles Qualité & Eau', icon: <FlaskConical className="w-4 h-4" /> },
                  ]
                },
                {
                  category: "Boutique & Services",
                  headerClass: "text-emerald-400 bg-emerald-950/20 border-l-2 border-emerald-500/60",
                  btnActive: "bg-slate-800/80 text-white border-l-4 border-emerald-400",
                  iconColor: "text-emerald-450 text-emerald-400",
                  items: [
                    { id: 'boutique', label: 'Boutique (Shop)', icon: <ShoppingBag className="w-4 h-4" /> },
                    { id: 'services', label: 'Lavage & Vidange', icon: <Wrench className="w-4 h-4" /> },
                  ]
                },
                {
                  category: "Finance & Clôture",
                  headerClass: "text-rose-400 bg-rose-950/20 border-l-2 border-rose-500/60",
                  btnActive: "bg-slate-800/80 text-white border-l-4 border-rose-400",
                  iconColor: "text-rose-450 text-rose-400",
                  items: [
                    { id: 'caisse', label: 'Caisse & Dépenses', icon: <Coins className="w-4 h-4" /> },
                    { id: 'journal', label: 'Journal de Station', icon: <FileText className="w-4 h-4" /> },
                    { id: 'cloture', label: 'Clôture de Jour', icon: <Lock className="w-4 h-4" /> },
                  ]
                },
                {
                  category: "Ressources Humaines",
                  headerClass: "text-purple-400 bg-purple-950/20 border-l-2 border-purple-500/60",
                  btnActive: "bg-slate-800/80 text-white border-l-4 border-purple-400",
                  iconColor: "text-purple-450 text-purple-400",
                  items: [
                    { id: 'employees', label: 'Personnel & Shifts', icon: <Users className="w-4 h-4" /> },
                  ]
                },
                {
                  category: "Logistique & Gérance (Pro)",
                  headerClass: "text-amber-500 bg-amber-950/25 border-l-2 border-amber-600/70",
                  btnActive: "bg-slate-800/80 text-white border-l-4 border-amber-500",
                  iconColor: "text-amber-450 text-amber-400",
                  items: [
                    { id: 'credits', label: 'Crédits Clients B2B', icon: <CreditCard className="w-4 h-4" /> },
                    { id: 'maintenance', label: 'Maintenance & Pannes', icon: <Wrench className="w-4 h-4" /> },
                    { id: 'settings', label: 'Paramètres Prix', icon: <Settings className="w-4 h-4" /> },
                  ]
                }
              ].map((rubric, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className={`px-3 py-0.5 text-[8px] font-extrabold uppercase tracking-widest ${rubric.headerClass}`}>
                    {rubric.category}
                  </div>
                  {rubric.items.map(mobileItem => {
                    const isS = activeTab === mobileItem.id;
                    return (
                      <button
                        key={mobileItem.id}
                        type="button"
                        onClick={() => {
                          setActiveTab(mobileItem.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-1.5 text-xs font-semibold ${
                          isS ? rubric.btnActive : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                        }`}
                      >
                        <span className={isS ? rubric.iconColor : 'text-slate-400'}>
                          {mobileItem.icon}
                        </span>
                        <span>{mobileItem.label}</span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </nav>
          </div>
        )}

        {/* 3. MAIN WORKSPACE CONTENT */}
        <main className="flex-1 p-3 sm:p-4 lg:p-5 overflow-y-auto max-w-[1500px] mx-auto w-full transition-all" id="main-content-flow">
          {renderCurrentView()}
        </main>
      </div>

      {/* --- SUPABASE CLOUD SYNC CONTROL MODAL --- */}
      {isSyncModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="supabase-sync-modal">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
            {/* Modal header */}
            <div className="p-4 bg-slate-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-sky-950 text-sky-400 rounded-lg">
                  <Database className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h2 className="font-bold text-sm tracking-tight text-white">Synchronisation Supabase Cloud</h2>
                  <p className="text-[10px] text-slate-400 leading-none mt-0.5">Liaisons en temps réel de votre base de données</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSyncModalOpen(false)}
                className="p-1 px-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs font-sans text-slate-600 flex-1">
              {/* 1. STATUS SUMMARY CARD */}
              <div className={`p-4 rounded-xl border ${
                supabaseStatus.connected 
                  ? supabaseStatus.schemaExists 
                    ? 'bg-emerald-50 border-emerald-250 text-emerald-900' 
                    : 'bg-amber-50 border-amber-250 text-amber-900'
                  : 'bg-rose-50 border-rose-250 text-rose-900'
              }`}>
                <div className="flex items-start gap-3">
                  {supabaseStatus.connected ? (
                    supabaseStatus.schemaExists ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    )
                  ) : (
                    <CloudOff className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <p className="font-bold text-sm leading-none text-slate-900">
                      {supabaseStatus.connected 
                        ? supabaseStatus.schemaExists 
                          ? 'Liaison Active & Opérationnelle' 
                          : 'Identifiants Valides, mais Schéma Absent'
                        : 'Impossible de joindre Supabase'}
                    </p>
                    <p className="text-[10px] opacity-90 font-mono tracking-tight break-all mt-1">
                      Host: {import.meta.env.NEXT_PUBLIC_SUPABASE_URL || 'Non spécifié'}
                    </p>
                    {supabaseStatus.error && (
                      <p className="text-[10px] text-red-700 font-bold font-mono mt-1">
                        Détail : {supabaseStatus.error}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. SYNC METRICS */}
              {supabaseStatus.connected && supabaseStatus.schemaExists && (
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase tracking-wider font-semibold">Dernier Import (Pull)</span>
                    <span className="font-mono font-bold text-slate-900">
                      {syncHistory.lastPullTime ? syncHistory.lastPullTime : 'Synchro en cours'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase tracking-wider font-semibold">Dernier Export (Push)</span>
                    <span className="font-mono font-bold text-slate-900">
                      {syncHistory.lastPushTime ? syncHistory.lastPushTime : "En attente d'événement"}
                    </span>
                  </div>
                </div>
              )}

              {/* 3. SCHEMA INTEGRATION SQL GUIDE (IF TABLE MISSING) */}
              {supabaseStatus.connected && !supabaseStatus.schemaExists && (
                <div className="space-y-2">
                  <div className="p-3 bg-amber-500/10 border border-amber-200/50 rounded-xl space-y-1 text-amber-950">
                    <p className="font-bold text-xs">Comment créer la table requise ?</p>
                    <p className="text-[10.5px] leading-relaxed">
                      Pour activer la persistance cloud, veuillez exécuter le script SQL ci-dessous dans votre <strong>Supabase SQL Editor</strong> :
                    </p>
                  </div>

                  <div className="relative bg-slate-900 text-slate-350 rounded-xl overflow-hidden font-mono text-[10px] leading-relaxed border border-slate-955 border-slate-950">
                    <div className="bg-slate-950 px-4 py-2 flex items-center justify-between text-slate-400 text-[9px] font-bold tracking-widest border-b border-slate-900">
                      <span>INIT_SCHEMA.SQL</span>
                      <button
                        type="button"
                        onClick={() => {
                          const sqlText = `-- Script d'initialisation pour la Station Barakat\nCREATE TABLE IF NOT EXISTS station_store (\n    id TEXT PRIMARY KEY,\n    value JSONB NOT NULL,\n    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL\n);\n\nALTER TABLE station_store ENABLE ROW LEVEL SECURITY;\n\nCREATE POLICY "Accés public pour station_store" ON station_store FOR ALL USING (true) WITH CHECK (true);`;
                          navigator.clipboard.writeText(sqlText)
                            .then(() => {
                              setCopiedSql(true);
                              setTimeout(() => setCopiedSql(false), 2000);
                            })
                            .catch(() => {
                              window.alert("Copie impossible. Veuillez sélectionner le texte manuellement ci-dessous.");
                            });
                        }}
                        className="flex items-center gap-1 hover:text-white transition-colors bg-white/5 py-1 px-2 rounded border border-white/10 cursor-pointer"
                      >
                        {copiedSql ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-450 text-emerald-400" /> Copié !
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" /> Copier le code
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="p-4 overflow-x-auto text-[10px] text-sky-300 leading-normal select-all">
{`-- Script d'initialisation pour la Station Barakat
CREATE TABLE IF NOT EXISTS station_store (
    id TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Activer la sécurité RLS
ALTER TABLE station_store ENABLE ROW LEVEL SECURITY;

-- Politique d'accès totale pour les requêtes anonymes
CREATE POLICY "Accès public pour station_store"
ON station_store FOR ALL
USING (true)
WITH CHECK (true);`}
                    </pre>
                  </div>
                </div>
              )}

              {/* 4. EXPLANATORY TEXT */}
              <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                L'application utilise un moteur de persistance hybride offline-first. Les données sont sauvegardées en temps réel dans votre navigateur localement, puis poussées de manière asynchrone vers Supabase, garantissant des temps de réponse instantanés pour les gérants de piste.
              </p>
            </div>

            {/* Modal footer / actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-150 flex flex-col sm:flex-row gap-2 justify-end">
              <button
                type="button"
                onClick={refreshSupabaseStatus}
                disabled={supabaseStatus.loading}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${supabaseStatus.loading ? 'animate-spin text-orange-500' : ''}`} /> Tester
              </button>
              {supabaseStatus.connected && supabaseStatus.schemaExists && (
                <>
                  <button
                    type="button"
                    onClick={() => pullFromSupabase(fuels, pumps, tanks, deliveries, shopProducts, shopSales, carWash, oilChanges, employees, shifts, cashRegisters, expenses, qualityTests, closureStatus, journalRecords, journalConfig, clientAccounts, creditTransactions, maintenanceIncidents, fuelPrices)}
                    disabled={supabaseStatus.loading}
                    className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-800 font-bold cursor-pointer disabled:opacity-50"
                  >
                    Importer (Pull-cloud)
                  </button>
                  <button
                    type="button"
                    onClick={pushAllToSupabase}
                    disabled={supabaseStatus.loading}
                    className="px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold cursor-pointer disabled:opacity-50"
                  >
                    Exporter (Push-cloud)
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => setIsSyncModalOpen(false)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-950 text-white font-bold cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
