import React from "react";
import ReactDOM from "react-dom";
import Web3 from "web3";
import "./../css/index.css";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      timer: 0,
      lastWinner: 0,
      numberOfBets: 0,
      minimumBet: 0,
      totalBet: 0,
      maxAmountOfBets: 0,
    };

    if (typeof web3 !== "undefined") {
      console.log("Using web3 detected from external source like Metamask");
      this.web3 = new Web3(web3.currentProvider);
    } else {
      console.log(
        "No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask"
      );
      this.web3 = new Web3(
        new Web3.providers.HttpProvider("http://localhost:8545")
      );
    }

    const MyContract = web3.eth.contract([
      {
        constant: false,
        inputs: [
          {
            name: "myid",
            type: "bytes32",
          },
          {
            name: "result",
            type: "string",
          },
        ],
        name: "__callback",
        outputs: [],
        payable: false,
        type: "function",
        stateMutability: "nonpayable",
      },
      {
        constant: false,
        inputs: [
          {
            name: "_queryId",
            type: "bytes32",
          },
          {
            name: "_result",
            type: "string",
          },
          {
            name: "_proof",
            type: "bytes",
          },
        ],
        name: "__callback",
        outputs: [],
        payable: false,
        type: "function",
        stateMutability: "nonpayable",
      },
      {
        constant: false,
        inputs: [
          {
            name: "numberToBet",
            type: "uint256",
          },
        ],
        name: "bet",
        outputs: [],
        payable: true,
        type: "function",
        stateMutability: "payable",
      },
      {
        constant: false,
        inputs: [
          {
            name: "player",
            type: "address",
          },
        ],
        name: "checkPlayerExists",
        outputs: [
          {
            name: "",
            type: "bool",
          },
        ],
        payable: false,
        type: "function",
        stateMutability: "nonpayable",
      },
      {
        constant: false,
        inputs: [],
        name: "distributePrizes",
        outputs: [],
        payable: false,
        type: "function",
        stateMutability: "nonpayable",
      },
      {
        constant: false,
        inputs: [],
        name: "generateNumberWinner",
        outputs: [],
        payable: true,
        type: "function",
        stateMutability: "payable",
      },
      {
        inputs: [
          {
            name: "_minimumBet",
            type: "uint256",
          },
          {
            name: "_maxAmountOfBets",
            type: "uint256",
          },
        ],
        payable: false,
        type: "constructor",
        stateMutability: "nonpayable",
      },
      {
        constant: true,
        inputs: [],
        name: "LIMIT_AMOUNT_BETS",
        outputs: [
          {
            name: "",
            type: "uint256",
          },
        ],
        payable: false,
        type: "function",
        stateMutability: "view",
      },
      {
        constant: true,
        inputs: [],
        name: "maxAmountOfBets",
        outputs: [
          {
            name: "",
            type: "uint256",
          },
        ],
        payable: false,
        type: "function",
        stateMutability: "view",
      },
      {
        constant: true,
        inputs: [],
        name: "minimumBet",
        outputs: [
          {
            name: "",
            type: "uint256",
          },
        ],
        payable: false,
        type: "function",
        stateMutability: "view",
      },
      {
        constant: true,
        inputs: [],
        name: "numberOfBets",
        outputs: [
          {
            name: "",
            type: "uint256",
          },
        ],
        payable: false,
        type: "function",
        stateMutability: "view",
      },
      {
        constant: true,
        inputs: [],
        name: "numberWinner",
        outputs: [
          {
            name: "",
            type: "uint256",
          },
        ],
        payable: false,
        type: "function",
        stateMutability: "view",
      },
      {
        constant: true,
        inputs: [
          {
            name: "",
            type: "uint256",
          },
        ],
        name: "players",
        outputs: [
          {
            name: "",
            type: "address",
          },
        ],
        payable: false,
        type: "function",
        stateMutability: "view",
      },
      {
        constant: true,
        inputs: [],
        name: "totalBet",
        outputs: [
          {
            name: "",
            type: "uint256",
          },
        ],
        payable: false,
        type: "function",
        stateMutability: "view",
      },
    ]);
    this.state.ContractInstance = MyContract.at(
      "0xdbbcf91654e7b67962c58e0b3578d748d6cee0e4"
    );

    window.a = this.state;
  }

  componentDidMount() {
    this.updateState();
    this.setupListeners();

    setInterval(this.updateState.bind(this), 7e3);
  }

  updateState() {
    this.state.ContractInstance.minimumBet((err, result) => {
      if (result != null) {
        this.setState({
          minimumBet: parseFloat(web3.fromWei(result, "ether")),
        });
      }
    });
    this.state.ContractInstance.totalBet((err, result) => {
      if (result != null) {
        this.setState({
          totalBet: parseFloat(web3.fromWei(result, "ether")),
        });
      }
    });
    this.state.ContractInstance.numberOfBets((err, result) => {
      if (result != null) {
        this.setState({
          numberOfBets: parseInt(result),
        });
      }
    });
    this.state.ContractInstance.maxAmountOfBets((err, result) => {
      if (result != null) {
        this.setState({
          maxAmountOfBets: parseInt(result),
        });
      }
    });
  }

  // Listen for events and executes the voteNumber method
  setupListeners() {
    let liNodes = this.refs.numbers.querySelectorAll("li");
    console.log(liNodes);
    liNodes.forEach((number) => {
      number.addEventListener("click", (event) => {
        event.target.className = "number-selected";
        this.voteNumber(parseInt(event.target.innerHTML), (done) => {
          // Remove the other number selected
          for (let i = 0; i < liNodes.length; i++) {
            liNodes[i].className = "";
          }
        });
      });
    });
  }

  voteNumber(number, cb) {
    let bet = this.refs["ether-bet"].value;

    if (!bet) bet = 0.1;

    if (parseFloat(bet) < this.state.minimumBet) {
      alert("You must bet more than the minimum");
      cb();
    } else {
      this.state.ContractInstance.bet(
        number,
        {
          gas: 300000,
          from: web3.eth.accounts[0],
          value: web3.toWei(bet, "ether"),
        },
        (err, result) => {
          cb();
        }
      );
    }
  }

  render() {
    return (
      <div className="main-container">
        <div className="row-top">
          <div className="col-top-front">
            <img src="../src/img/logo.jpg" width="350px" height="200px"></img>
          </div>
          <div className="col-top-back">
            <br />
            <label className="title">
              Bet with your <b className="title-bold">LUCKIEST</b> number
            </label>
            <br />
            <label className="body-text">
              - - - - - - - - - - - - - - - - - - - -
            </label>
            <br />
            <label className="title2">
              Win <b className="title2-bold">HUGE</b> amounts of{" "}
              <b className="title2-bold">ETHER</b> !!
            </label>
          </div>
        </div>

        <hr />
        <br />

        <div className="row-body">
          <div className="col-body-front">
            <br />
            <br />
            <br />
            <div className="block">
              <b className="ttext">
                <i className="fas fa-chess-queen ggold"></i>
                &nbsp;&nbsp;&nbsp;&nbsp;Timer:
              </b>{" "}
              &nbsp;
              <span ref="timer"> {this.state.timer}</span>
            </div>
            <br />
            <div className="block">
              <b className="ttext">
                <i className="fas fa-chess-queen ggold"></i>
                &nbsp;&nbsp;&nbsp;&nbsp;Number of bets:
              </b>{" "}
              &nbsp;
              <span>{this.state.numberOfBets}</span>
            </div>
            <br />
            <div className="block">
              <b className="ttext">
                <i className="fas fa-chess-queen ggold"></i>
                &nbsp;&nbsp;&nbsp;&nbsp;Last winner:
              </b>{" "}
              &nbsp;
              <span>{this.state.lastWinner}</span>
            </div>
            <br />
            <div className="block">
              <b className="ttext">
                <i className="fas fa-chess-queen ggold"></i>
                &nbsp;&nbsp;&nbsp;&nbsp;Total ether bet:
              </b>{" "}
              &nbsp;
              <span>{this.state.totalBet} ether</span>
            </div>
            <br />
            <div className="block">
              <b className="ttext">
                <i className="fas fa-chess-queen ggold"></i>
                &nbsp;&nbsp;&nbsp;&nbsp;Minimum bet:
              </b>{" "}
              &nbsp;
              <span>{this.state.minimumBet} ether</span>
            </div>
            <br />
            <div className="block">
              <b className="ttext">
                <i className="fas fa-chess-queen ggold"></i>
                &nbsp;&nbsp;&nbsp;&nbsp;Max amount of bets:
              </b>
              &nbsp;
              <span>{this.state.maxAmountOfBets}</span>
            </div>
          </div>
          <div className="col-body-back">
            <div className="center-content">
              <label className="title3-bold">Vote for the next number</label>
              <br />
              <br />
              <label>
                <b className="subtitle3">
                  How much Ether do you want to bet?&nbsp;&nbsp;&nbsp;&nbsp;
                  <input
                    className="bet-input"
                    ref="ether-bet"
                    type="number"
                    placeholder={this.state.minimumBet}
                  />
                  Ethers
                </b>
                <br />
                <br />
              </label>

              <ul ref="numbers">
                <li>1</li>
                <li>2</li>
                <li>3</li>
                <li>4</li>
                <li>5</li>
                <li>6</li>
                <li>7</li>
                <li>8</li>
                <li>9</li>
                <li>10</li>
              </ul>
            </div>
          </div>
        </div>

        <hr />

        <div>
          <i>Only working with the Ropsten Test Network</i>
        </div>
        <div>
          <i>You can only vote once per account</i>
        </div>
        <div>
          <i>Your vote will be reflected when the next block is mined</i>
        </div>
      </div>
    );
  }
}
ReactDOM.render(<App />, document.querySelector("#root"));
