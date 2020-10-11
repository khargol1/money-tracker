let db;

const request = indexedDB.open('money_tracker', 1);

request.onupgradeneeded = function(event){
    const db = event.target.result;
    db.createObjectStore('new_money', {autoIncrement: true});
};

request.onsuccess = function(event){
    db = event.target.result;

    if(navigator.onLine){
        uploadMoney();
    }
};

request.onerror = function(event){
    console.log(event.target.errorCode);
};

function saveRecord (record) {
    const transaction = db.transaction(['new_money'], 'readwrite');

    const moneyObjectStore = transaction.objectStore('new_money');

    moneyObjectStore.add(record);
}

function uploadMoney(){
    const transaction = db.transaction(['new_money'], 'readwrite');

    const moneyObjectStore = transaction.objectStore('new_money');

    const getAll = moneyObjectStore.getAll();

    getAll.onsuccess = function(){
        if(getAll.result.length > 0){
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if(serverResponse.message){
                    throw new Error(serverResponse);
                }

                const transaction = db.transaction(['new_money'], 'readwrite');
                const moneyObjectStore = transaction.objectStore('new_money');

                moneyObjectStore.clear();
            })
            .catch(err => {
                console.log(err);
            });
            
        }
    };
}

window.addEventListener('online', uploadMoney);
