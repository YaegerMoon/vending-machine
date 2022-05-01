import { vendingMachineFactory, ProductLineUp } from "./VendingMachine";

const products: [ProductLineUp, { price: number; amount: number }][] = [
  ["콜라", { price: 1100, amount: 3 }],
  ["물", { price: 600, amount: 1 }],
  ["커피", { price: 700, amount: 0 }],
];
const vendingMachine = vendingMachineFactory(products);

function scenario_1() {
  console.log("#######SCENARIO 1##########");
  vendingMachine.ui.dispatch("현금투입", 500);
  vendingMachine.ui.dispatch("현금투입", 1000);
  vendingMachine.ui.dispatch("현금투입", 500);

  vendingMachine.ui.dispatch("제품선택", "콜라");
  vendingMachine.ui.dispatch("제품선택", "콜라");

  vendingMachine.ui.dispatch("현금반환");
}

function scenario_2() {
  console.log("#######SCENARIO 2##########");

  vendingMachine.ui.dispatch("카드태깅", "4734-2342-3242-3242");
  vendingMachine.ui.dispatch("제품선택", "콜라");
}

function scenario_3() {
  console.log("#######SCENARIO 3##########");

  vendingMachine.ui.dispatch("카드태깅", "4734-2342-3242-3242");
  vendingMachine.ui.dispatch("제품선택", "콜라");
}

function scenario_4() {
  console.log("#######SCENARIO 4##########");

  vendingMachine.ui.dispatch("현금투입", 1000);
  vendingMachine.ui.dispatch("카드태깅", "4734-2342-3242-3242");
  vendingMachine.ui.dispatch("제품선택", "콜라");
}

scenario_1();
scenario_2();
scenario_3();
scenario_4();
