import axios from 'axios';
import { reactive } from 'vue';
import { io } from 'socket.io-client';
import store from '@/store';

// CONFIG
const MOCK_MODE = false; // Set to false to test real backend
const SOCKET_URL = `http://${window.location.hostname}:5051`;

// State
const state = reactive({
    tickets: [],
    kitchenState: {}, // Kept for ephemeral UI state (e.g., startedAt for timers)
    bumpedTickets: {}, // { ticketId: timestamp } — recently bumped, skip from cargarCestas
    isConnected: false,
    lastUpdated: Date.now(),
    showHistory: false,
    hiddenArticleIds: new Set(),
    soundEnabled: true,
    // Reset stats per session/start as requested ("que cada vez que se inicie ... se reinicie")
    completedToday: 0,
    avgPrepTime: 0,
    prepTimes: [], // Historical prep times for the current session
    stateVersion: 0 // Incremental counter to trigger Vue reactivity
});

// Helper Functions
const loadHiddenArticles = async () => {
    try {
        const res = await axios.post('articulos/getHiddenArticles');
        if (res.data) {
            state.hiddenArticleIds = new Set(res.data.map(a => a._id));
        }
    } catch (e) {
        console.error('Failed to load hidden articles', e);
    }
};

const hideArticle = async (articleId) => {
    try {
        await axios.post('articulos/ocultarEnCocina', { idArticulo: articleId, ocultar: true });
        state.hiddenArticleIds.add(articleId);
    } catch (e) {
        console.error('Failed to hide article', e);
    }
};

const isArticleHidden = (articleId) => {
    return state.hiddenArticleIds.has(articleId);
};


// Mock Data Generator (Video Context)
const generateMockTickets = () => {
    const now = Date.now();
    return [
        {
            id: 'mock_1',
            tableId: 'Salón 2 15',
            diners: 5,
            timestamp: now - (5 * 60 * 1000), // 5 mins ago
            courses: [
                {
                    id: 'primeros',
                    name: 'Primeros',
                    items: [
                        { id: 'item_1', name: 'Carpaccio', quantity: 2 },
                        { id: 'item_2', name: 'Guisantes', quantity: 3 }
                    ]
                },
                {
                    id: 'segundos',
                    name: 'Segundos',
                    items: [
                        { id: 'item_3', name: 'Arroz Menú', quantity: 1 },
                        { id: 'item_4', name: 'Chuletas', quantity: 1 },
                        { id: 'item_5', name: 'Salmón', quantity: 2 },
                        { id: 'item_6', name: 'Pollo', quantity: 1 }
                    ]
                },
                {
                    id: 'postres',
                    name: 'Postres',
                    items: [
                        { id: 'item_7', name: 'Pastel del día', quantity: 1 },
                        { id: 'item_8', name: 'Milhojas', quantity: 3 },
                        { id: 'item_9', name: 'Fruta', quantity: 1 }
                    ]
                }
            ]
        },
        {
            id: 'mock_2',
            tableId: 'Salón 2 14bis',
            diners: 2,
            timestamp: now, // Just now
            courses: [
                {
                    id: 'primeros',
                    name: 'Primeros',
                    items: [
                        { id: 'item_10', name: 'Guisantes', quantity: 1 },
                        { id: 'item_11', name: 'Pappardelle', quantity: 1 }
                    ]
                },
                {
                    id: 'segundos',
                    name: 'Segundos',
                    items: [
                        { id: 'item_12', name: 'Arroz Menú', quantity: 1 },
                        { id: 'item_13', name: 'Salmón', quantity: 1 }
                    ]
                }
            ]
        },
        {
            id: 'mock_3',
            tableId: 'Terraza 4',
            diners: 4,
            timestamp: now - (25 * 60 * 1000), // 25 mins ago (LATE)
            courses: [
                {
                    id: 'postres',
                    name: 'Postres',
                    items: [
                        { id: 'item_14', name: 'Torrija', quantity: 2, notes: 'Una con helado de vainilla' },
                        { id: 'item_15', name: 'Coulant', quantity: 2 }
                    ]
                }
            ]
        }
    ];
};



// Mesa name cache (fetched from backend)
let mesasCache = {}; // { 'salaId': [{nombre, _id, idCesta}, ...] }
let salasCache = []; // [{id, name, icon}, ...]

const fetchMesasAndSalas = async () => {
    try {
        // Fetch salas
        const salasRes = await axios.get('mesas/getSalas');
        if (salasRes.data) {
            salasCache = salasRes.data;
        }

        // Fetch mesas for each sala (and default 'MESAS')
        const salaIds = ['MESAS', ...salasCache.map(s => s.id)];
        for (const salaId of salaIds) {
            try {
                const mesasRes = await axios.get(`mesas/getMesas?salaId=${salaId}`);
                if (mesasRes.data) {
                    mesasCache[salaId] = mesasRes.data;
                }
            } catch (e) {
                console.warn(`Failed to fetch mesas for sala ${salaId}`, e);
            }
        }
        console.log('Mesas cache loaded:', Object.keys(mesasCache).length, 'salas');
    } catch (e) {
        console.error('Failed to fetch salas/mesas', e);
    }
};

const getTableDisplayName = (cesta) => {
    const salaId = cesta.salaId || 'MESAS';
    const indexMesa = cesta.indexMesa;

    // Try to find custom name from mesa data
    const mesas = mesasCache[salaId];
    if (mesas && mesas[indexMesa] && mesas[indexMesa].nombre) {
        return mesas[indexMesa].nombre;
    }

    // Build from sala name + index
    let salaLabel = 'Principal';
    if (salaId !== 'MESAS') {
        const sala = salasCache.find(s => s.id === salaId);
        if (sala) salaLabel = sala.name;
        else salaLabel = salaId;
    }

    return `${salaLabel} ${indexMesa + 1}`;
};

// Familia cache: { articuloId: familiaName }
const familiaCache = {};

const fetchFamilias = async (ids) => {
    const uncachedIds = ids.filter(id => !(id in familiaCache));
    if (uncachedIds.length === 0) return;
    try {
        const res = await axios.post('articulos/getFamiliasByIds', { ids: uncachedIds });
        if (res.data) Object.assign(familiaCache, res.data);
    } catch (err) {
        console.warn('Failed to fetch familias:', err.message);
    }
};

// Data Transformation (Cesta -> KitchenTicket)
const transformCestaToTicket = async (cesta) => {
    // Skip cestas that are not assigned to a table (worker cestas)
    if (cesta.indexMesa === null || cesta.indexMesa === undefined) return null;

    // Skip cestas with no items
    if (!cesta.lista || cesta.lista.length === 0) return null;

    // Filter to items that have a kitchen printer assigned AND have been sent to prepare (printed)
    const kitchenItems = cesta.lista.filter(item => {
        // Must have been printed (sent to prepare)
        const isPrinted = (item.printed && item.printed > 0) || 
                          (item.instancias && item.instancias.some(i => i.printed));
        
        if (!isPrinted) return false;

        // And must have a kitchen printer assigned
        if (item.impresora) return true;
        
        return false;
    });

    if (kitchenItems.length === 0) return null;

    // Collect all menu sub-item IDs for familia lookup
    const menuSubItemIds = [];
    kitchenItems.forEach(item => {
        if (item.articulosMenu && item.articulosMenu.length > 0) {
            item.articulosMenu.forEach(sub => menuSubItemIds.push(sub.idArticulo));
        }
    });

    // Fetch familias for sub-items if needed
    if (menuSubItemIds.length > 0) {
        await fetchFamilias(menuSubItemIds);
    }

    // Build courses: collect ALL menu sub-items across ALL menus, then group by familia
    const regularItems = [];
    const allMenuSubItems = {}; // { familia: [ items... ] }

    kitchenItems.forEach((item, index) => {
        // Calculate effective printed quantity
        const printedQty = item.printed || (item.instancias ? item.instancias.filter(i => i.printed).length : 0);
        
        if (item.articulosMenu && item.articulosMenu.length > 0) {
            // Collect sub-items grouped by familia (merged across all menus)
            item.articulosMenu.forEach((subItem, subIndex) => {
                const familia = familiaCache[subItem.idArticulo] || 'Otros';
                if (!allMenuSubItems[familia]) allMenuSubItems[familia] = [];
                
                // For sub-items, we scale the quantity to match the 'printed' units of the parent menu
                // If it's a menu with 1 unit and printed=1, it takes the sub-item quantity as is.
                const effectiveSubQty = (printedQty / item.unidades) * subItem.unidades;

                allMenuSubItems[familia].push({
                    id: `${cesta._id}_menu_${item.idArticulo}_${index}_${subIndex}`,
                    backendId: subItem.instanceId || subItem.idArticulo.toString(),
                    idArticulo: subItem.idArticulo,
                    name: subItem.nombre,
                    quantity: effectiveSubQty,
                    notes: '',
                    supplements: (() => {
                        let sups = [];
                        if (subItem.arraySuplementos) sups.push(...subItem.arraySuplementos.map(s => s.nombre));
                        if (subItem.suplementosPorArticulo) {
                            subItem.suplementosPorArticulo.forEach(g => {
                                if (g.suplementos) sups.push(...g.suplementos.map(s => s.nombre));
                            });
                        }
                        return sups;
                    })(),
                    status: subItem.kdsStatus || 'PENDING',
                    readyCount: subItem.readyCount || 0
                });
            });
        } else {
            // Regular item
            regularItems.push({
                id: `${cesta._id}_${item.idArticulo}_${index}`,
                backendId: item.instanceId || item.idArticulo.toString(),
                idArticulo: item.idArticulo,
                name: item.nombre,
                quantity: printedQty,
                notes: item.comentario || '',
                supplements: (() => {
                    let sups = [];
                    if (item.arraySuplementos) sups.push(...item.arraySuplementos.map(s => s.nombre));
                    if (item.suplementosPorArticulo) {
                        item.suplementosPorArticulo.forEach(g => {
                            if (g.suplementos) sups.push(...g.suplementos.map(s => s.nombre));
                        });
                    }
                    return sups;
                })(),
                status: item.kdsStatus || 'PENDING',
                readyCount: item.readyCount || 0
            });
        }
    });

    // Build courses from merged familia groups
    const courses = Object.entries(allMenuSubItems).map(([familia, items]) => ({
        id: `familia_${familia}`,
        name: familia,
        items: items
    }));

    // Add regular items as a "Cocina" course at the top
    if (regularItems.length > 0) {
        courses.unshift({
            id: 'general',
            name: 'Cocina',
            items: regularItems
        });
    }

    if (courses.length === 0) return null;

    // Timer Sync: Rely strictly on backend kdsTimestamp if available.
    // Ensure accurate timer: only starts when items are legally sent to kitchen
    let startedAt = cesta.kdsTimestamp || Date.now();

    return {
        id: cesta._id,
        tableName: getTableDisplayName(cesta),
        salaId: cesta.salaId,
        indexMesa: cesta.indexMesa,
        diners: cesta.comensales || 1,
        timestamp: startedAt,
        courses: courses
    };
};

// Logic
const init = async () => {
    loadHiddenArticles();

    // Fetch mesa names from backend
    await fetchMesasAndSalas();

    // Ensure we have the latest room names in store too
    if (store && !MOCK_MODE) {
        store.dispatch('Tables/fetchSalas');
    }

    // Load ephemeral local state (timers, etc)
    const savedState = localStorage.getItem('kitchenState');
    if (savedState) {
        state.kitchenState = JSON.parse(savedState);
    }

    if (MOCK_MODE) {
        state.tickets = generateMockTickets();
        state.isConnected = true;
    } else {
        const socket = io(SOCKET_URL);
        
        socket.on('connect', () => {
            state.isConnected = true;
            socket.emit('cargarCestas');
        });

        socket.on('disconnect', () => {
            state.isConnected = false;
        });

        socket.on('cargarCestas', async (cestas) => {
            const prevCount = state.tickets.length;

            // Skip recently bumped cestas — they'll be cleaned up by the backend
            const now = Date.now();
            const filteredCestas = cestas.filter(c => {
                const bumpTime = state.bumpedTickets[c._id];
                if (!bumpTime) return true;
                // Auto-expire after 30s
                if (now - bumpTime > 30000) {
                    delete state.bumpedTickets[c._id];
                    return true;
                }
                return false;
            });

            // Filter and transform (async for familia lookups)
            const activeTickets = (await Promise.all(
                filteredCestas.map(transformCestaToTicket)
            )).filter(ticket => ticket !== null);
            
            // Play sound if new tickets arrived
            if (activeTickets.length > prevCount && prevCount > 0) {
                playNewTicketSound();
            }

            state.tickets = activeTickets;

            // Cleanup orphaned kitchenState entries
            cleanupOldState();
        });
    }

    // Auto-update timer reference every second
    setInterval(() => {
        state.lastUpdated = Date.now();
    }, 1000);
};

const getItemStatus = (ticketId, itemId) => {
    const ticket = state.tickets.find(t => t.id === ticketId);
    if (!ticket) return 'PENDING';
    for (const course of ticket.courses) {
        const item = course.items.find(i => i.id === itemId);
        if (item) return item.status || 'PENDING';
    }
    return 'PENDING';
};

const getReadyCount = (ticketId, itemId) => {
    const ticket = state.tickets.find(t => t.id === ticketId);
    if (!ticket) return 0;
    for (const course of ticket.courses) {
        const item = course.items.find(i => i.id === itemId);
        if (item) return item.readyCount || 0;
    }
    return 0;
};

const toggleItemStatus = async (ticketId, itemId, maxQty, forceStatus) => {
    const ticket = state.tickets.find(t => t.id === ticketId);
    if (!ticket) return;

    let itemRef = null;
    for (const course of ticket.courses) {
        const found = course.items.find(i => i.id === itemId);
        if (found) {
            itemRef = found;
            break;
        }
    }
    if (!itemRef) return;

    let nextStatus = 'PENDING';
    let nextCount = itemRef.readyCount || 0;

    if (forceStatus) {
        nextStatus = forceStatus;
        if (forceStatus === 'READY' || forceStatus === 'SERVED') nextCount = maxQty;
        else if (forceStatus === 'PENDING') nextCount = 0;
    } else {
        if (itemRef.status === 'PENDING' || !itemRef.status) {
            nextStatus = 'PREPARING';
        } else if (itemRef.status === 'PREPARING') {
            nextCount++;
            if (nextCount >= maxQty) {
                nextStatus = 'READY';
            } else {
                nextStatus = 'PREPARING';
            }
        } else if (itemRef.status === 'READY') {
            nextStatus = 'PENDING';
            nextCount = 0;
        }
    }

    try {
        // Optimistic UI update — increment locally for instant feedback
        itemRef.status = nextStatus;
        itemRef.readyCount = nextCount;
        state.stateVersion++;
        
        console.log(`[KDS] Update: ${ticketId} item ${itemRef.backendId} status -> ${nextStatus} (${nextCount})`);

        await axios.post('cestas/setItemKdsStatus', {
            idCesta: ticketId,
            idItem: itemRef.backendId,
            status: nextStatus,
            readyCount: nextCount
        });
        // Sockets (cargarCestas) will eventually sync this back definitively
    } catch (err) {
        console.error("Error updating status in MongoDB", err);
    }
};

const saveState = () => {
    localStorage.setItem('kitchenState', JSON.stringify(state.kitchenState));
};

const getCompletedAt = (ticketId) => {
    // When all items are READY, we might want to store this in MongoDB too.
    // For now, derive from the ticket items if needed or local cache.
    return state.kitchenState[`${ticketId}_completedAt`] || null;
};

const getReadyCount_legacy = (ticketId, itemId) => {
    return 0;
};
const getItemStatus_legacy = (ticketId, itemId) => {
    return 'PENDING';
};

const completeSection = (ticketId, courseId) => {
    const ticket = state.tickets.find(t => t.id === ticketId);
    if (!ticket) return;

    const course = ticket.courses.find(c => c.id === courseId);
    if (!course) return;

    course.items.forEach(item => {
        // This logic is now handled by the backend via toggleItemStatus
        // For now, we'll keep this as a local UI state change if needed,
        // but ideally this would also call a backend endpoint.
        // For this refactor, we'll assume this function is deprecated or needs a backend call.
        // For now, it will only affect the ephemeral kitchenState.
        state.kitchenState[`${ticketId}_${item.id}`] = 'SERVED';
    });
    // saveState(); // Removed localStorage save
};

const restoreSection = (ticketId, courseId) => {
    const ticket = state.tickets.find(t => t.id === ticketId);
    if (!ticket) return;

    const course = ticket.courses.find(c => c.id === courseId);
    if (!course) return;

    course.items.forEach(item => {
        const key = `${ticketId}_${item.id}`;
        // Revert to READY (or PENDING if prefered, but usually if you undo a serve, it's ready)
        // Let's set to READY so it doesn't disappear if ShowHistory is off, but is crossed out.
        // Or better: delete the state so it goes to PENDING?
        // User said "undo... in case I selected the wrong one". 
        // If I restore, it should probably go back to 'READY' (checked) or 'PENDING' (unchecked).
        // Let's reset to PENDING (delete key) to be safe/clear.
        delete state.kitchenState[key];
    });
    // saveState(); // Removed localStorage save
};

const toggleHistory = () => {
    state.showHistory = !state.showHistory;
};

const toggleSound = () => {
    state.soundEnabled = !state.soundEnabled;
    // localStorage.setItem('kdsSoundEnabled', JSON.stringify(state.soundEnabled)); // Removed localStorage save
};

const playNewTicketSound = () => {
    if (!state.soundEnabled) return;
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
        console.warn('Sound not supported', e);
    }
};

const bumpTicket = (ticketId) => {
    const ticket = state.tickets.find(t => t.id === ticketId);
    if (!ticket) return;

    // Calculate prep time (incremental average)
    const completedAt = state.kitchenState[`${ticketId}_completedAt`];
    const endTime = completedAt || Date.now();
    const prepDuration = (endTime - new Date(ticket.timestamp).getTime()) / 1000;
    // Cap prepTimes to last 50 to prevent unbounded growth
    if (state.prepTimes.length >= 50) state.prepTimes.shift();
    state.prepTimes.push(prepDuration);
    const n = state.prepTimes.length;
    state.avgPrepTime = state.avgPrepTime + (prepDuration - state.avgPrepTime) / n;
    state.completedToday++;

    // Mark all items as SERVED (this is now ephemeral, backend handles actual status)
    ticket.courses.forEach(course => {
        course.items.forEach(item => {
            state.kitchenState[`${ticketId}_${item.id}`] = 'SERVED';
        });
    });

    // Remove ticket from array immediately for instant UI removal
    const idx = state.tickets.findIndex(t => t.id === ticketId);
    if (idx !== -1) state.tickets.splice(idx, 1);

    // Update stateVersion immediately for instant UI response
    state.stateVersion++;

    // Track this ticket as bumped so cargarCestas skips it
    state.bumpedTickets[ticketId] = Date.now();

    // Persist bump to MongoDB so other screens see the removal
    axios.post('cestas/bumpKdsTicket', { idCesta: ticketId })
        .catch(err => console.error('Failed to bump ticket globally', err));
};

// let saveTimeout = null; // Removed
// const saveState = () => { // Removed
//     state.stateVersion++;
//     deferSave();
// };

// Debounced localStorage write — avoids blocking UI on rapid clicks (removed)
// const deferSave = () => {
//     if (saveTimeout) clearTimeout(saveTimeout);
//     saveTimeout = setTimeout(() => {
//         localStorage.setItem('kitchenState', JSON.stringify(state.kitchenState));
//     }, 300);
// };

// Separate deferred save for stats (prepTimes can be large) (removed)
// let statsTimeout = null;
// const deferSaveStats = () => {
//     if (statsTimeout) clearTimeout(statsTimeout);
//     statsTimeout = setTimeout(() => {
//         localStorage.setItem('kdsCompletedToday', state.completedToday);
//         localStorage.setItem('kdsPrepTimes', JSON.stringify(state.prepTimes));
//     }, 500);
// };

// Remove kitchenState entries for tickets that no longer exist
const cleanupOldState = () => {
    const ticketIds = new Set(state.tickets.map(t => t.id));
    const toDelete = [];
    for (const key in state.kitchenState) {
        // Keys are like 'ticketId_itemId' or 'ticketId_completedAt' or 'ticketId_startedAt'
        const parts = key.split('_');
        const ticketId = parts[0];
        if (ticketId && !ticketIds.has(ticketId)) {
            toDelete.push(key);
        }
    }
    if (toDelete.length > 0) {
        toDelete.forEach(k => delete state.kitchenState[k]);
        // deferSave(); // Removed localStorage save
    }
};

export default {
    state,
    init,
    toggleItemStatus,
    completeSection,
    restoreSection,
    toggleHistory,
    toggleSound,
    bumpTicket,
    hideArticle,
    isArticleHidden,
    getItemStatus,
    getCompletedAt,
    getReadyCount
};
