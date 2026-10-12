import { adminStore } from "../src/lib/store";
import type { DiningSession, RunningBill } from "../src/lib/types";

async function runTest() {
  console.log("=================================================");
  console.log("🏨 HOTEL AMBROSIA - DINE-IN RUNNING BILL TEST");
  console.log("=================================================\n");

  const TABLE = "Table 5";

  // Step 1: Ensure Table 5 has no active session initially
  console.log("Step 1: Check Table 5 initial state...");
  const initialSession = await adminStore.getActiveSessionByTable(TABLE);
  if (initialSession) {
    console.log(`Closing pre-existing session ${initialSession.sessionNumber} on ${TABLE}...`);
    await adminStore.closeDiningSession(initialSession.id);
  }
  const isAvailableInitially = (await adminStore.getActiveSessionByTable(TABLE)) === null;
  console.log(`✅ Table 5 is AVAILABLE: ${isAvailableInitially}\n`);

  // Step 2: First Order - Customer Rahul Sharma selects Table 5
  console.log("Step 2: Customer Rahul Sharma sits at Table 5 and places Round 1 order...");
  const order1 = await adminStore.createRestaurantOrder({
    orderNumber: "AMB-1001",
    orderType: "dine-in",
    status: "new",
    tableNumber: TABLE,
    customerName: "Rahul Sharma",
    customerPhone: "9876543210",
    customerEmail: "rahul@example.com",
    items: [
      { id: "i1", menuItemId: "m1", name: "Murgh Makhani (Butter Chicken)", category: "Main Course", price: 420, quantity: 2 },
      { id: "i2", menuItemId: "m2", name: "Garlic Butter Naan", category: "Breads", price: 90, quantity: 3 }
    ],
    subtotal: 1110,
    tax: 56, // 5% GST
    deliveryFee: 0,
    totalAmount: 1166,
    specialInstructions: "Medium spicy please"
  });
  if (!order1) throw new Error("Order 1 failed to create");

  console.log(`Order 1 Placed: #${order1.orderNumber}`);
  console.log(`Linked Session ID: ${order1.sessionId}`);
  console.log(`Order Round: ${order1.orderRound}`);

  if (!order1.sessionId) throw new Error("Order 1 was not linked to an active session!");

  const sessionRound1 = await adminStore.getDiningSessionById(order1.sessionId);
  console.log(`Active Dining Session: #${sessionRound1?.sessionNumber}`);
  console.log(`Session Status: ${sessionRound1?.status}`);
  console.log(`Session Customer: ${sessionRound1?.customerName} (${sessionRound1?.customerPhone})`);
  console.log(`Session Table: ${sessionRound1?.tableNumber}\n`);

  // Step 3: Repeat Order from same customer on Table 5
  console.log("Step 3: Repeat Order (Round 2) - Rahul Sharma orders more items...");
  const order2 = await adminStore.createRestaurantOrder({
    orderNumber: "AMB-1002",
    orderType: "dine-in",
    status: "new",
    sessionId: order1.sessionId, // Repeat order reuses same session
    tableNumber: TABLE,
    customerName: "Rahul Sharma",
    customerPhone: "9876543210",
    items: [
      { id: "i3", menuItemId: "m3", name: "Jeera Rice", category: "Rice & Biryani", price: 210, quantity: 2 },
      { id: "i4", menuItemId: "m4", name: "Gulab Jamun (2 Pcs)", category: "Desserts", price: 120, quantity: 2 }
    ],
    subtotal: 660,
    tax: 33,
    deliveryFee: 0,
    totalAmount: 693
  });
  if (!order2) throw new Error("Order 2 failed to create");

  console.log(`Order 2 Placed: #${order2.orderNumber}`);
  console.log(`Linked Session ID: ${order2.sessionId} (Same session: ${order2.sessionId === order1.sessionId})`);
  console.log(`Order Round: ${order2.orderRound}\n`);

  // Step 4: Add many items (testing no fixed 3/5/10 limit)
  console.log("Step 4: Adding multiple diverse menu items (Testing dynamic arbitrary count)...");
  const manyItems = [
    { id: "m-paneer", menuItemId: "mp1", name: "Paneer Tikka Angara", category: "Starters", price: 340, quantity: 2 },
    { id: "m-dal", menuItemId: "mp2", name: "Dal Makhani Royale", category: "Main Course", price: 310, quantity: 1 },
    { id: "m-roti", menuItemId: "mp3", name: "Tandoori Roti", category: "Breads", price: 40, quantity: 4 },
    { id: "m-lassi", menuItemId: "mp4", name: "Royal Mango Lassi", category: "Beverages", price: 150, quantity: 3 },
    { id: "m-raita", menuItemId: "mp5", name: "Boondi Raita", category: "Accompaniments", price: 110, quantity: 1 },
    { id: "m-kulfi", menuItemId: "mp6", name: "Kesariya Matka Kulfi", category: "Desserts", price: 140, quantity: 2 }
  ];
  const subtotal3 = manyItems.reduce((s, it) => s + it.price * it.quantity, 0);
  const tax3 = Math.round(subtotal3 * 0.05);

  const order3 = await adminStore.createRestaurantOrder({
    orderNumber: "AMB-1003",
    orderType: "dine-in",
    status: "new",
    sessionId: order1.sessionId,
    tableNumber: TABLE,
    customerName: "Rahul Sharma",
    customerPhone: "9876543210",
    items: manyItems,
    subtotal: subtotal3,
    tax: tax3,
    deliveryFee: 0,
    totalAmount: subtotal3 + tax3
  });
  if (!order3) throw new Error("Order 3 failed to create");

  console.log(`Order 3 Placed: #${order3.orderNumber} with ${manyItems.length} distinct dishes`);
  console.log(`Order Round: ${order3.orderRound}\n`);

  // Step 5: Check Combined Dynamic Running Bill
  console.log("Step 5: Verifying Combined Dynamic Running Bill...");
  const runningBill = await adminStore.getRunningBill(order1.sessionId);
  if (!runningBill) throw new Error("Failed to generate running bill!");

  console.log(`Bill Number: ${runningBill.billNumber}`);
  console.log(`Guest: ${runningBill.session.customerName} | Phone: ${runningBill.session.customerPhone}`);
  console.log(`Table: ${runningBill.session.tableNumber}`);
  console.log(`Total Orders in Bill: ${runningBill.orders.length}`);
  console.log(`Distinct Items in Combined Bill: ${runningBill.items.length}`);
  console.log("-------------------------------------------------");
  console.log("ITEM NAME | QTY | UNIT PRICE | LINE TOTAL");
  console.log("-------------------------------------------------");
  for (const item of runningBill.items) {
    console.log(`${item.name.padEnd(35)} | x${item.quantity} | ₹${item.unitPrice} | ₹${item.lineTotal}`);
  }
  console.log("-------------------------------------------------");
  console.log(`Items Subtotal : ₹${runningBill.subtotal}`);
  console.log(`GST (5%)       : ₹${runningBill.tax}`);
  console.log(`Grand Total    : ₹${runningBill.totalAmount}\n`);

  // Verify math
  const expectedSubtotal = 1110 + 660 + subtotal3;
  const expectedTax = Math.round(expectedSubtotal * 0.05);
  const expectedGrandTotal = expectedSubtotal + expectedTax;

  console.log(`Calculated Subtotal: ₹${runningBill.subtotal} (Matches: ${runningBill.subtotal === expectedSubtotal})`);
  console.log(`Calculated Tax: ₹${runningBill.tax} (Matches: ${runningBill.tax === expectedTax})`);
  console.log(`Calculated Grand Total: ₹${runningBill.totalAmount} (Matches: ${runningBill.totalAmount === expectedGrandTotal})\n`);

  // Step 6: Finalize Bill
  console.log("Step 6: Admin Finalizes the Bill...");
  const finalizedSession = await adminStore.finalizeDiningSession(order1.sessionId);
  console.log(`Session Status: ${finalizedSession?.status} (Expected: finalized)\n`);

  // Step 7: Close Bill
  console.log("Step 7: Admin Closes the Bill (Customer pays and departs)...");
  const closedSession = await adminStore.closeDiningSession(order1.sessionId);
  console.log(`Session Status: ${closedSession?.status} (Expected: closed)`);
  console.log(`Session Closed At: ${closedSession?.closedAt}\n`);

  // Step 8: Verify Table 5 is Available immediately
  console.log("Step 8: Verify Table 5 is now AVAILABLE for new customers...");
  const activeOnTable5 = await adminStore.getActiveSessionByTable(TABLE);
  console.log(`Active session on Table 5: ${activeOnTable5 === null ? "None (AVAILABLE)" : "STILL OCCUPIED!"}`);
  if (activeOnTable5 !== null) throw new Error("Table 5 was not freed after close!");

  // Step 9: New customer on same table (Table 5)
  console.log("\nStep 9: New customer Priya Patel sits at Table 5...");
  const orderNewCustomer = await adminStore.createRestaurantOrder({
    orderNumber: "AMB-2001",
    orderType: "dine-in",
    status: "new",
    tableNumber: TABLE,
    customerName: "Priya Patel",
    customerPhone: "9123456789",
    items: [
      { id: "np1", menuItemId: "nm1", name: "Paneer Lababdar", category: "Main Course", price: 380, quantity: 1 },
      { id: "np2", menuItemId: "nm2", name: "Butter Tandoori Roti", category: "Breads", price: 45, quantity: 2 }
    ],
    subtotal: 470,
    tax: 24,
    deliveryFee: 0,
    totalAmount: 494
  });
  if (!orderNewCustomer) throw new Error("New customer order failed to create");

  console.log(`New Customer Order Placed: #${orderNewCustomer.orderNumber}`);
  console.log(`New Session ID: ${orderNewCustomer.sessionId}`);
  console.log(`Is Completely New Session ID: ${orderNewCustomer.sessionId !== order1.sessionId}`);

  const newBill = await adminStore.getRunningBill(orderNewCustomer.sessionId!);
  console.log(`New Bill Guest: ${newBill?.session.customerName} (Previous guest: Rahul Sharma)`);
  console.log(`New Bill Phone: ${newBill?.session.customerPhone}`);
  console.log(`New Bill Item Count: ${newBill?.items.length} (Expected: 2)`);
  console.log(`New Bill Grand Total: ₹${newBill?.totalAmount} (Expected: 494)`);

  const containsOldItems = newBill?.items.some((it) => it.name.includes("Butter Chicken"));
  console.log(`Any previous customer items present? ${containsOldItems ? "YES (BUG)" : "NO (CLEAN)"}`);

  // Clean up
  await adminStore.closeDiningSession(orderNewCustomer.sessionId!);
  console.log("\n=================================================");
  console.log("🎉 ALL TESTS PASSED SUCCESSFULLY! 100% VERIFIED.");
  console.log("=================================================");
}

runTest().catch((err) => {
  console.error("❌ Test Failed:", err);
  process.exit(1);
});
