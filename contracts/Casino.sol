pragma solidity ^0.4.16;


contract Casino {
    address public owner;
    uint256 public minimumBet;
    uint256 public totalBet;
    uint256 public numberOfBets;
    uint256 public maximumBetsNr = 100;
    address[] public players;

    struct Player {
        uint256 amountBet;
        uint256 numberSelected;

    }

    // The address of the player and => the user info
    mapping(address => Player) public playerInfo;

    function Casino(uint256 _minimumBet) public payable{
        owner = msg.sender;
        if (_minimumBet != 0) 
            minimumBet = _minimumBet;

    }

    function() public payable {}

    function kill() public {
        if (msg.sender == owner) 
            selfdestruct(owner);

    }

    function checkPlayerExists(address player) public constant returns(bool) {
        for (uint256 i = 0; i < players.length; i++) {
            if (players[i] == player) 
                return true;
        }
        return false;

    }

    // To bet for a number between 1 and 10 both inclusive
    function bet(uint256 numberSelected) public payable {
        require(!checkPlayerExists(msg.sender));
        require(numberSelected <= 10 && numberSelected >= 1);
        require(msg.value >= minimumBet);
        playerInfo[msg.sender].amountBet = msg.value;
        playerInfo[msg.sender].numberSelected = numberSelected;
        numberOfBets++;
        players.push(msg.sender);
        totalBet += msg.value;
        if (numberOfBets >= maximumBetsNr) 
            generateNumberWinner();
        //We need to change this in order to be secure

    }

    // Generates a number between 1 and 10 that will be the winner
    function generateNumberWinner() public {
        uint256 numberGenerated = uint8(uint256(keccak256(block.timestamp, block.difficulty))%251);
        distributePrizes(numberGenerated);
    }

    // Sends the corresponding ether to each winner depending on the total bets
    function distributePrizes(uint256 numberWinner) public {
        address[100] memory winners;
        uint256 count = 0;
        uint256 winnerTotalBet = 0;
        for (uint256 i = 0; i < players.length; i++) {
            address playerAddress = players[i];
            if (playerInfo[playerAddress].numberSelected == numberWinner) {
                winners[count] = playerAddress;
                winnerTotalBet += playerInfo[playerAddress].amountBet;
                count++;
            }
            delete playerInfo[playerAddress];
        }

        players.length = 0;
    
        uint256 winnerEtherAmount = 0;
        uint256 percentageAmount = 0;
        for (uint256 j = 0; j < winners.length; j++){
            if (winners[j] != address(0)) {
                percentageAmount = winnerTotalBet/playerInfo[winners[j]].amountBet;
                winnerEtherAmount = percentageAmount*totalBet;
                winners[j].transfer(winnerEtherAmount);
            }
        }
        resetData();
    }

    function resetData() public {
        players.length = 0;
        totalBet = 0;
        numberOfBets = 0;
    }

}