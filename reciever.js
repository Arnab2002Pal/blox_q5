const express = require('express');

const app = express();
const port = 4000; 

app.use(express.json());

let receiverBalance = 2000;
async function receiver(amount, senderAccount) {
    console.log("Current Balance: " , receiverBalance);
    receiverBalance += amount;
    console.log(`Received Amount: ${amount}, Updated Balance: ${receiverBalance}, Sender Account: ${senderAccount}`);
    return true;
  }

app.post('/receive-data', async(req, res) => {

    const {senderAccount , amount , receiverAccount} = req.body
    console.log(`Amount Recieved at ${receiverAccount} from account: ${senderAccount} of Rs.${amount}`);

    try {
        const isReceiveSuccess = await receiver(amount, senderAccount);

    res.json({
      success: isReceiveSuccess
    });
    } catch (error) {
        res.status(500).json({
        error: "Internal Error"
    });
    }    
    
});

app.listen(port, () => {
    console.log(`Receiver Server listening on port ${port}`);
});
