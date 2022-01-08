import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Xarrow from 'react-xarrows';
import {Binomial} from 'sampson'


function Card(props) {
    const img_path = indexToImage(props.value);
    const card_val = indexToCard(props.value);
    const card_id = props.deckNumber + "-" + card_val;

    return (
        <button className="card" id={card_id}>
            {/* {card_val} */}
            <img src={require(`${img_path}`)} alt={card_val}/>
        </button>
    );
}
  
class Deck extends React.Component {
    renderCard(i) {
        const val = this.props.cards[i];
        const deckNumber = this.props.deckNumber;
        const key = String(val) + String(deckNumber);
        return (
            <Card 
                key={key}
                value={this.props.cards[i]}
                deckNumber={this.props.deckNumber}
            />
        );
    }

    render() {
        const cards = [...Array(52).keys()].map((card) => {
            return this.renderCard(card);
        })

        return (
            <div>
                {cards}
            </div>
        );
    }
}
  
class Game extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            decks: [{
                cards: [...Array(52).keys()],
            }],
            deckNumber: 0,
        };
    }


    shuffle(method) {
        const decks = this.state.decks;
        const deck = decks[decks.length - 1].cards;

        let shuffled;
        if (method === 'outFaro') {
            shuffled = outFaro(deck);
        } else if (method === 'inFaro') {
            shuffled = inFaro(deck);
        } else if (method === 'riffle') {
            shuffled = riffle(deck);
        } else if (method === 'antiFaro') {
            shuffled = antiFaro(deck);
        }


        console.log(shuffled);
        this.setState({
            decks: decks.concat([{
                cards: shuffled,
            }]),
            deckNumber: this.state.deckNumber + 1,
        });
    }

    render() {
        const decks = this.state.decks;

        const shuffles = decks.map((deck, deckNumber) => {
            return (
                <li key={deckNumber} className="deck">
                    <Deck cards={deck.cards} deckNumber={deckNumber}/>
                </li>
              );
        })

        let lines;
        if (decks.length > 1) {
            lines = decks.map((deck, deckNumber) => {
                const cards = deck.cards;
                if (deckNumber === decks.length - 1) {
                    return null;
                }
                return (cards.map((card) => {
                    const card_val = indexToCard(card);
                    const card1Id = String(deckNumber) + '-' + card_val;
                    const card2Id = String(deckNumber + 1) + '-' + card_val;
                    const arrowKey = "arrow" + card1Id;
                    const arrowColor = cardColor(card_val);
                    return (<Xarrow 
                                key={arrowKey} 
                                start={card1Id} 
                                end={card2Id} 
                                startAnchor='bottom' 
                                endAnchor='top' 
                                path='straight' 
                                color={arrowColor}
                                headShape={'circle'}
                                showHead={false}
                                strokeWidth={2}
                            />)
                }))
            })
        }

        return (
            <div className="game">
                <span className="controls">
                    <button className="shuffleButton" onClick={() => this.shuffle("riffle")}>Riffle</button>
                    <button className="shuffleButton" onClick={() => this.shuffle("outFaro")}>Out Faro</button>
                    <button className="shuffleButton" onClick={() => this.shuffle("inFaro")}>In Faro</button>
                    <button className="shuffleButton" onClick={() => this.shuffle("antiFaro")}>Anti-Faro</button>
                </span>
                <div>
                    <ol className="deck-container">{shuffles}</ol>
                </div>
                {/* <div className="decks">{shuffles}</div> */}
                

                {lines}


            </div>
        );
    }
}
  
  // ========================================
  
  ReactDOM.render(
    <Game />,
    document.getElementById('root')
  );
  


function indexToCard(index) {
    // const SUITS = ["clubs", "hearts", "spades", "diamonds"];
    // const VALS = ["ace", "2", "3", "4", "5", "6", "7", "8", "9", "10", "jack", "queen", "king"];
    const SUITS = ["C", "H", "S", "D"];
    const VALS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    const suit_index = Math.floor(index / 13);
    const val_index = index % 13;
    // return VALS[val_index] + "_of_" + SUITS[suit_index];
    return VALS[val_index] + SUITS[suit_index];
}

function indexToImage(index) {
    const SUITS = ["clubs", "hearts", "spades", "diamonds"];
    const VALS = ["ace", "2", "3", "4", "5", "6", "7", "8", "9", "10", "jack", "queen", "king"];
    const suit_index = Math.floor(index / 13);
    const val_index = index % 13;
    return "./card_imgs/" + VALS[val_index] + "_of_" + SUITS[suit_index] + ".png";
}

function cardColor(card) {
    const suit = card[card.length - 1];
    if (suit === 'H' || suit === "D") {
        return 'red';
    }
    return 'black';
}

function antiFaro(deck) {
    const firstHalf = [];
    const secondHalf = [];
    for (let i = 0; i < deck.length; i++) {
        if (i % 2) {
            firstHalf.push(deck[i]);
        } else {
            secondHalf.push(deck[i]);
        }
    }
    return firstHalf.concat(secondHalf);
}

function outFaro(deck) {
    const shuffled = deck.slice(0, (deck.length / 2)).flatMap((card, i) => [card, deck[i + (deck.length / 2)]]);
    return shuffled;
}

function inFaro(deck) {
    const shuffled = deck.slice(0, (deck.length / 2)).flatMap((card, i) => [deck[i + (deck.length / 2)], card]);
    return shuffled;
}

function riffle(deck) {
    const numberCards = deck.length;
    const pos = Binomial.random({"n":numberCards, "p":0.5});
    console.log(pos);
    const left = deck.slice(0,pos);
    const right = deck.slice(pos, numberCards);
    const shuffled = [];
    for (let i = 0; i < numberCards; i++) {
        let p = Math.random();
        let thresh = left.length / (left.length + right.length);
        if (p < thresh) {
            shuffled.push(left.shift());
        } else {
            shuffled.push(right.shift());
        }
    }
    return shuffled;
}