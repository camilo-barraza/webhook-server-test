const { createObjectCsvWriter } = require('csv-writer');

const csvWriter = createObjectCsvWriter({
    path: 'output.csv',
    header: [
        {id: 'id', title: 'ID'},
        {id: 'first_name', title: 'FIRST_NAME'},
        {id: 'last_name', title: 'LAST_NAME'},
        {id: 'email', title: 'EMAIL'},
        {id: 'date', title: 'DATE'},
        {id: 'salary', title: 'SALARY'}
    ]
});

// Function to generate a random string
function randomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

// Function to generate a random email
function randomEmail() {
    return `${randomString(5)}@example.com`;
}

// Function to generate a random date
function randomDate() {
    const start = new Date(2020, 0, 1);
    const end = new Date();
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toLocaleDateString('en-US');
}

// Function to generate a random salary
function randomSalary() {
    return (Math.random() * (100000 - 30000) + 30000).toFixed(2);
}

const generateData = () => {
    const data = [];
    for (let i = 1; i <= 1000000; i++) {
        data.push({
            id: i,
            first_name: randomString(7),
            last_name: randomString(10),
            email: randomEmail(),
            date: randomDate(),
            salary: randomSalary()
        });
    }
    return data;
};

csvWriter.writeRecords(generateData())
    .then(() => {
        console.log('The CSV file was written successfully');
    })
    .catch(err => {
        console.error('Error generating CSV file:', err);
    });
