import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Xarrow, {useXarrow, Xwrapper} from 'react-xarrows';
import {Binomial} from 'sampson'

const ScrolledDiv = ({ children}) => {
    const updateXarrow = useXarrow();
    return (
      <div
        className="deck-container"
        onScroll={updateXarrow}>
        {children}
      </div>
    );
  };

function Card(props) {
    const img_path = indexToImage(props.value);
    const card_val = indexToCard(props.value);
    const card_id = props.deckNumber + "-" + card_val;

    const className = props.view ? "card-view" : "card";

    return (
        <div className="inner">
            <button className={className} id={card_id} onClick={() => props.handleCardClick({card_val})}>
                {/* {card_val} */}
                <img src={require(`${img_path}`)} alt={card_val}/>
            </button>
        </div>
        
    );
}


  
class Deck extends React.Component {
    renderCard(i) {
        const val = this.props.cards[i];
        const deckNumber = this.props.deckNumber;
        const key = String(val) + String(deckNumber);
        const handleCardClick = this.props.handleCardClick;

        return (
            <Card 
                key={key}
                value={this.props.cards[i]}
                deckNumber={this.props.deckNumber}
                view={this.props.view}
                handleCardClick={handleCardClick}
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
  
class Slider extends React.Component {
    handleChange(event) {
        const val = event.target.value;

        const cards = document.getElementsByClassName("card-view");

        for (let i = 0; i < cards.length; i++) {
            let card = cards[i];
            card.style.width = val + "vw";
        }
        window.scrollTo(0,document.body.scrollHeight - 700);
    }
    
    render() {
        return <input id="typeinp" type="range" min="3" max="10" defaultValue="4.5" step=".1" onChange={this.handleChange}/>
    }

}


function Lines(props) {
    const decks = props.decks;
    const selectedCards = props.selectedCards;
    const emptySelectedCards = selectedCards.size;


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
                // const arrowColor = cardColor(card_val);
                let arrowColor;
                if (emptySelectedCards) {
                    arrowColor = selectedCards.has(card_val) ? "red" : "silver";
                } else {
                    arrowColor = cardColor(card_val);
                }
                // if (!selectedCards.has(card_val)) {
                //     return null;
                // }

                return (<Xarrow 
                            key={arrowKey} 
                            start={card1Id} 
                            end={card2Id} 
                            startAnchor='bottom' 
                            endAnchor='top' 
                            curveness={0.15} 
                            path='smooth' 
                            color={arrowColor}

                            showHead={false}
                            strokeWidth={1.5}
                        />)
            }))
        })
    }
    return <div className="lines">{lines}</div>
}

class App extends React.Component {
    constructor(props) {
        super(props);

        // https://stackoverflow.com/questions/39176248/react-js-cant-read-property-of-undefined
        this.handleCardClick = this.handleCardClick.bind(this);
        this.state = {
            decks: [{
                cards: [...Array(52).keys()],
            }],
            deckNumber: 0,
            view: 0,
            selectedCards: new Set(),
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
        } else if (method === "fisherYates") {
            shuffled = fisherYates(deck);
        } else if (method === 'shuffleTo') {
            const orders = shuffleTo(deck, [...Array(52).keys()]);

            this.setState({
                decks: decks.concat(orders),
                deckNumber: this.state.deckNumber + orders.length,
                view: this.state.deckNumber + orders.length,
            });
            
            return;
        }


        this.setState({
            decks: decks.concat([{
                cards: shuffled,
            }]),
            deckNumber: this.state.deckNumber + 1,
            view: this.state.deckNumber + 1,
        });
    }

    handleDeckClick(deckNumber) {
        this.setState({
            view: deckNumber,
        });
    }

    handleCardClick(card) {
        const selectedCards = this.state.selectedCards;
        const card_val = card.card_val;
        selectedCards.has(card_val) ? selectedCards.delete(card_val) : selectedCards.add(card_val);
        this.setState({
            selectedCards: selectedCards,
        });
        console.log(this.state.selectedCards);
    }
    
    render() {
        const decks = this.state.decks;
        const view = this.state.view;
        const viewDeck = decks[view].cards;

        const shuffles = decks.map((deck, deckNumber) => {
            return (
                <li key={deckNumber} className="deck" onClick={() => this.handleDeckClick(`${deckNumber}`)}>
                    <Deck cards={deck.cards} deckNumber={deckNumber} handleCardClick={this.handleCardClick}/>
                </li>
              );
        })

        return (
            <div className="game">
                <span className="controls">
                    <button className="shuffleButton" onClick={() => this.shuffle("riffle")}>Riffle</button>
                    <button className="shuffleButton" onClick={() => this.shuffle("fisherYates")}>Fisher-Yates</button>
                    <button className="shuffleButton" onClick={() => this.shuffle("outFaro")}>Out Faro</button>
                    <button className="shuffleButton" onClick={() => this.shuffle("inFaro")}>In Faro</button>
                    <button className="shuffleButton" onClick={() => this.shuffle("antiFaro")}>Anti-Faro</button>
                    <button className="shuffleButton" onClick={() => this.shuffle("shuffleTo")}>Riffle to NDO</button>

                    <Slider></Slider>
                </span>
                <Xwrapper>
                    <ScrolledDiv className="deck-container">
                        <ol >{shuffles}</ol>

                    </ScrolledDiv >
                    <Lines decks={this.state.decks} selectedCards={this.state.selectedCards}></Lines>
                </Xwrapper>
                
                {/* <div className="deck-container" id="deck-container">
                    <ol >{shuffles}</ol>
                </div> */}

                <div className="deck-view"><Deck cards={viewDeck} deckNumber={view} view={true}/></div>
                


            </div>
        );
    }
}
  
  // ========================================
  
  ReactDOM.render(
    <App />,
    document.getElementById('root')
  );
  


function indexToCard(index) {
    const SUITS = ["C", "H", "S", "D"];
    const VALS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    const suit_index = Math.floor(index / 13);
    const val_index = index % 13;
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
    return secondHalf.concat(firstHalf);
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

function risingSequences(mapping, cards) {
    const numberCards = cards.length;
    const seqs = [];
    const deck = values(mapping, cards);
    const marked = new Set();
    for (let i = 0; i < numberCards; i++) {
        if (!marked.has(i)) {
            marked.add(i);
            let start = deck.indexOf(i);
            let curr = deck[start];
            const seq = [curr];
            for (let j = start; j < numberCards; j++) {
                if (deck[j] === curr + 1) {
                    marked.add(deck[j]);
                    curr = deck[j];
                    seq.push(curr);
                }
            }
            seqs.push(seq);
        }
    }


    return seqs;
}


function toCull(mapping, deck) {
    let result = [];
    const seqs = risingSequences(mapping, deck);
    for (let i = 0; i < seqs.length; i++) {
        if (i % 2 !== 0) {
            result = result.concat(seqs[i]);
        }
    }
    return result;
}

function cull(mapping, cards) {
    const bits = [];
    let cutCard = null;

    const cardsToCull = toCull(mapping, cards);

    const vals = values(mapping, cards);
    for (let i = 0; i < vals.length; i++) {
        let card = vals[i];
        if (cardsToCull.includes(card)) {
            bits.push(0);
        } else {
            if (cutCard !== null) {
                cutCard = card;
            }
            bits.push(1);
        }
    }

    const conBits = consecutiveBits(bits);
    if (conBits.length % 2) {
        for (let i = 0; i < conBits.length - 1; i += 2) {
            // console.log(conBits[i], conBits[i+1])
        }
        // console.log(conBits[conBits.length - 1]);

    } else {
        for (let i = 0; i < conBits.length; i += 2) {
            // console.log(conBits[i], conBits[i+1])
        }
    }

    // https://stackoverflow.com/questions/46622486/what-is-the-javascript-equivalent-of-numpy-argsort
    const dsu = (arr1, arr2) => arr1
        .map((item, index) => [arr2[index], item]) // add the args to sort by
        .sort(([arg1], [arg2]) => arg2 - arg1) // sort by the args
        .map(([, item]) => item); // extract the sorted items


    const culled = dsu(cards, bits);
    return culled;

//     self.cards = [self.cards[k] for k in np.argsort(bits, kind='stable')]
}

function consecutiveBits(bits) {
    const lengths = [];
    let prev = bits[0];
    let currLength = 0;
    for (let bit in bits) {
        if (bit === prev) {
            currLength += 1;
        } else {
            lengths.push(currLength);
            currLength = 1;
            prev = bit;
        }
    }
    lengths.push(currLength);
    return lengths;
}

function shuffleTo(mapping, deck) {
    const orders = [];
    let current = deck;
    while (risingSequences(mapping, current).length > 1) {
        orders.push({cards: current});
        current = cull(mapping, current);
    }

    orders.reverse();
    return orders;
}

function values(mapping, deck) {
    const vals = deck.map((card) => {
        return mapping.indexOf(card)
    });
    return vals;
}

/**
 * Shuffles array in place. ES6 version
 * @param {Array} deck items An array containing the items.
 */
function fisherYates(deck) {
    deck = deck.slice();
    var j, x, i;
    for (i = deck.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = deck[i];
        deck[i] = deck[j];
        deck[j] = x;
    }
    return deck;
}
// function changeViewSize(val) {
//     const cards = document.getElementsByClassName("card-view");

//     for (let i = 0; i < cards.length; i++) {
//         let card = cards[i];
//         console.log(card);
//         card.style.width = val + "vw";
//     }
// }