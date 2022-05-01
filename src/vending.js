const events = require("events");
const display = (...input) => {
  console.log("\x1b[33m%s\x1b[0m", ...input);
};
const productExit = (...input) => {
  console.log("\x1b[36m%s\x1b[0m", ...input);
};
const cashExit = (...input) => {
  console.log("\x1b[32m%s\x1b[0m", ...input);
};
function vendingMachineFactory(products) {
  const ui = new UserInterface();
  const inventory = new Inventory(products);
  return new VendingMachine(inventory, ui);
}
exports.vendingMachineFactory = vendingMachineFactory;
class VendingMachine {
  constructor(inventory, ui) {
    this.inventory = inventory;
    this.ui = ui;
    this.cardNum = "";
    this.timeout = null;
    this.returnCash = () => {
      cashExit(`현금 반환: ${this.budget} 원`);
      this.budget = 0;
      this.payMode = "준비";
      if (this.timeout) clearTimeout(this.timeout);
      display("준비 모드 On!");
    };
    this.insertCash = (amount) => {
      this.payMode = "현금";
      this.budget = amount + this.budget;
      if (this.timeout) {
        clearTimeout(this.timeout);
      }
      display("누적 현금 " + this.budget);
      // 아무런 동작이 없이 10초가 지나면 현금 반환하고 준비모드가 됨
      this.timeout = setTimeout(this.returnCash, 10 * 1000);
    };
    this.convertCardMode = (cardNum) => {
      if (this.payMode === "현금") this.returnCash();
      this.cardNum = cardNum;
      this.payMode = "카드";
      display("카드 모드 ON!");
      // 카드 모드에서 아무런 동작이 없이 10초가 지나면 준비모드가 됨
      this.timeout = setTimeout(() => {
        this.payMode = "준비";
        display("준비 모드 ON!");
      }, 10 * 1000);
    };
    this.selectProduct = async (productName) => {
      if (!this.inventory.check(productName)) {
        display("재고가 없습니다.");
        return;
      }
      const price = this.inventory.getPrice(productName);
      if (this.payMode === "현금") {
        if (price > this.budget) {
          display("돈이 부족합니다.");
          return;
        }
        this.budget -= price;
      } else if (this.payMode === "카드") {
        const resp = await this.pgApi.pay(this.cardNum, price);
        if (resp.message !== "done") {
          display("카드 결제가 거부되었습니다.");
          return;
        }
        this.payMode = "준비";
        if (this.timeout) clearTimeout(this.timeout);
      } else {
        // 준비 모드에서는 어떤 동작도 일어나지 않습니다.
        return;
      }
      //제품이 출고 됩니다.
      this.inventory.release(productName);
    };
    this.budget = 0;
    this.payMode = "준비";
    this.pgApi = new PGapi();
    this, this.eventInit();
  }
  eventInit() {
    this.ui.registerAction("현금투입", this.insertCash);
    this.ui.registerAction("현금반환", this.returnCash);
    this.ui.registerAction("카드태깅", this.convertCardMode);
    this.ui.registerAction("제품선택", this.selectProduct);
  }
}
class Inventory {
  constructor(products) {
    this.stock = new Map(products);
  }
  check(productName) {
    const product = this.stock.get(productName);
    if (!product) return false;
    return product.amount > 0;
  }
  getPrice(productName) {
    const product = this.stock.get(productName);
    if (!product) return 0;
    return product.price;
  }
  release(productName) {
    const product = this.stock.get(productName);
    if (!product) {
      throw new Error("제품을 찾을수 없습니다.");
    }
    product.amount -= 1;
    this.stock.set(productName, product);
    productExit("제품 받아라!! : " + productName);
  }
}
class UserInterface {
  constructor() {
    this.emitter = new events.EventEmitter();
  }
  registerAction(actionType, action) {
    this.emitter.on(actionType, action);
  }
  dispatch(actionType, ...arg) {
    this.emitter.emit(actionType, ...arg);
  }
}
class PGapi {
  constructor() {}
  async pay(card, price) {
    return {
      message: "done",
    };
  }
}
