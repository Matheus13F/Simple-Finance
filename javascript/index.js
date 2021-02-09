const Modal = {
    open() {
        document.querySelector('.modal-overlay').classList.add('active');
    },
    close() {
        document.querySelector('.modal-overlay').classList.remove('active');

    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("simple.finances:transactions")) || []
    },

    set(transactions) {
        localStorage.setItem("simple.finances:transactions", JSON.stringify(transactions))
    }
}

const Transaction = {
    all: Storage.get(),

    add(transaction) {
        Transaction.all.push(transaction);
        App.reload();
    },

    remove(index) {
        Transaction.all.splice(index, 1);

        App.reload();
    },

    incomes() {
        let income = 0;
        Transaction.all.forEach(money => {
            if( money.amount > 0) {
                income += money.amount;
            }
        })
        return income
    },
    expanses() {
        let expanse = 0;
        Transaction.all.forEach(money => {
            if (money.amount < 0) {
                expanse += money.amount;
            }
        })

        return expanse
    },
    total() {

        return Transaction.incomes() + Transaction.expanses();
    }
}

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr');
        tr.innerHTML = DOM.inneHTMLTransaction(transaction, index);
        tr.dataset.index = index;
        DOM.transactionsContainer.appendChild(tr);
    },

    inneHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount > 0 ? "income" : "expanse";

        const amount = Utils.formatCurrency(transaction.amount);

        const html = `           
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover Transação">
            </td>           
        `
        return html;
    },

    updateBalance() {
        document.getElementById('incomeDisplay').innerHTML = Utils.formatCurrency(Transaction.incomes());
        document.getElementById('expanseDisplay').innerHTML = Utils.formatCurrency(Transaction.expanses());
        document.getElementById('totalDisplay').innerHTML = Utils.formatCurrency(Transaction.total());
    },

    clearTransaction() {
        DOM.transactionsContainer.innerHTML = "";
    }
}

const Utils = {
    formatAmount(value) {
        value = Number(value.replace(/\,\./g, "")) * 100;

        return value;        
    },

    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : "";
        
        value = String(value).replace(/\D/g, "");

        value = Number(value) / 100;

        value = value.toLocaleString("pt-br", {
            style: "currency",
            currency: "BRL"
        })
        
        return signal + value;
    },

    formatDate(value) {
        const splittedDate = value.split("-");
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value,
        }
    },

    validateFields() {
        const { description, amount, date } = Form.getValues();
        
        if(description.trim() === "" || amount.trim()  === "" || date.trim() === "") {
            throw new Error("Preencha todos os campos");
        }
    },

    formatValues() {
        let { description, amount, date } = Form.getValues();
        amount = Utils.formatAmount(amount);
        date = Utils.formatDate(date);
        
        return {
            description,
            amount,
            date
        }
    },

    clearFields() {
        Form.description.value = "";
        Form.amount.value = "";
        Form.date.value = "";
    },

    submit(event) {
        event.preventDefault();

        try {
            Form.validateFields();
            const transaction = Form.formatValues();

            Transaction.add(transaction);

            Form.clearFields();

            Modal.close();

        } catch (error) {
            alert(error.message)
        }        
    }
}



const App = {
    init() {
        Transaction.all.forEach((transaction, index) => {
            DOM.addTransaction(transaction, index);
        })
        
        DOM.updateBalance();

        Storage.set(Transaction.all);
    },

    reload() {
        DOM.clearTransaction();
        App.init();
    }
}

App.init();
