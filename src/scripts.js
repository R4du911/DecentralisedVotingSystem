var votingSystem;
var userAccount;

async function startApp() {
    try {
        const response = await fetch('votingsystem_abi.json');

        if (!response.ok) {
            throw new Error('Failed to load ABI JSON file');
        }

        const json = await response.json();
        const votingSystemABI = json.abi;

        //change at each node rerun
        const votingSystemAddress = "0x341D0FFC249719C16BafF4087680117D3D83D578";

        if (window.ethereum) {
            window.web3 = new Web3(window.ethereum);

            try {
                await window.ethereum.request({ method: 'eth_requestAccounts' });
            } catch (error) {
                console.error("User denied account access");
                return;
            }
        } else if (window.web3) {
            window.web3 = new Web3(window.web3.currentProvider);
        } else {
            console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
            return;
        }

        votingSystem = new web3.eth.Contract(votingSystemABI, votingSystemAddress);

        const accounts = await web3.eth.getAccounts();
        userAccount = accounts[0];

        await updateBallots();

        setInterval(async function() {
            const newAccounts = await web3.eth.getAccounts();
            if (newAccounts[0] !== userAccount) {
                userAccount = newAccounts[0];
                await updateBallots();
            }
        }, 500);

        document.getElementById('createBallotForm').onsubmit = createBallot;

    } catch (error) {
        console.error('Error starting the app:', error);
    }
}



async function updateBallots() {
    const closedBallots = await getClosedBallots();
    displayClosedBallots(closedBallots);

    const ongoingBallots = await getOngoingBallots();
    displayOngoingBallots(ongoingBallots);
}

function displayClosedBallots(ballotResults) {
    $("#closedBallots").empty();

    if (!ballotResults || ballotResults.length === 0) {
        $("#closedBallots").append("<p>No closed ballots found.</p>");
        return;
    }

    for (const ballotResult of ballotResults) {
        $("#closedBallots").append(`
            <div class="closedBallot">
                <ul>
                    <li>Question: ${ballotResult.question}</li>
                    <li>Winning Option: ${ballotResult.winningOption}</li>
                    <li>Winning Votes Number: ${ballotResult.winningVotesNumber}</li>
                    <li>All Votes Number: ${ballotResult.allVotesNumber}</li>
                    <li>Vote count option 1: ${ballotResult.allVoteCounts[0]}</li>
                </ul>
            </div>
        `);
    }
}

function displayOngoingBallots(ballotResults) {
    $("#ongoingBallots").empty();

    if (!ballotResults || ballotResults.length === 0) {
        $("#ongoingBallots").append("<p>No ongoing ballots found.</p>");
        return;
    }

    for (const ballotResult of ballotResults) {
        $("#ongoingBallots").append(`
            <div class="ongoingBallot">
                <ul>
                    <li>Question: ${ballotResult.question}</li>
                    <li>Option 1: ${ballotResult.options[0]}</li>
                    <li>Start Time: ${ballotResult.startTime}</li>
                    <li>End Time: ${ballotResult.endTime}</li>
                    <li>Have you voted: ${ballotResult.hasSenderVoted}</li>
                </ul>
            </div>
        `);
    }
}



async function getClosedBallots() {
    try {
        const result = await votingSystem.methods.getClosedBallots().call();

        console.log('Closed ballots fetched:', result);
        return result;
    } catch (error) {
        console.error('Error fetching closed ballots:', error);
        return [];
    }
}

async function getOngoingBallots() {
    try {
        const accounts = await web3.eth.getAccounts();
        const result = await votingSystem.methods.getOngoingBallots().call({ from: accounts[0] });

        console.log('Ongoing ballots fetched:', result);
        return result;
    } catch (error) {
        console.error('Error fetching ongoing ballots:', error);
        return [];
    }
}

async function createBallot(event) {
    event.preventDefault();

    const question = document.getElementById('question').value;
    const options = document.getElementById('options').value.split(',');
    const startTime = parseInt(document.getElementById('startTime').value);
    const endTime = parseInt(document.getElementById('endTime').value);

    try {
        const accounts = await web3.eth.getAccounts();
        await votingSystem.methods.createBallot(question, options, startTime, endTime).send({ from: accounts[0] });

        alert('Ballot created successfully!');
        await updateBallots(); 
    } catch (error) {
        console.error('Error creating ballot:', error);
        alert('Failed to create ballot.');
    }
}


window.addEventListener('load', function() {
    if (typeof window.ethereum !== 'undefined' || typeof window.web3 !== 'undefined') {
        startApp();
    } else {
        console.log("Please install MetaMask to use this application.");
    }
});

if (window.ethereum) {
    window.ethereum.on('disconnect', () => {
        console.log('MetaMask disconnected');
    });

    window.ethereum.on('message', (message) => {
        console.log('MetaMask message:', message);
    });
}