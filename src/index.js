import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Xarrow, {useXarrow, Xwrapper} from 'react-xarrows';
import {Binomial} from 'sampson';
import {Decks} from "./decks.js";

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
    const cardIndex = props.value
    const card_val = props.indexToCard(cardIndex);
    const img_path = cardToImage(card_val);
    const card_id = props.deckNumber + "-" + card_val;

    const className = props.view ? "card-view" : "card";
    const cardWidth = props.cardWidth;

    return (
        <div className="inner">
            <button 
                className={className} 
                id={card_id} 
                onClick={() => props.handleCardClick({cardIndex})} 
                style={{width: cardWidth + "rem"}}
            >
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
                indexToCard={this.props.indexToCard}
                handleCardClick={handleCardClick}
                cardWidth={this.props.cardWidth}
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
 
function Slider(props) {
    return (
        <input 
            id="typeinp" 
            type="range" 
            min="0.8" 
            max="5" 
            defaultValue="1.5" 
            step=".05" 
            onChange={props.handleChange}
        />
    )
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
                const card_val = props.indexToCard(card);
                const card1Id = String(deckNumber) + '-' + card_val;
                const card2Id = String(deckNumber + 1) + '-' + card_val;
                const arrowKey = "arrow" + card1Id;
                // const arrowColor = cardColor(card_val);
                let arrowColor;
                if (emptySelectedCards) {
                    arrowColor = selectedCards.has(card_val) ? cardColor(card_val) : "silver";
                } else {
                    arrowColor = cardColor(card_val);
                }

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
        this.indexToCard = this.indexToCard.bind(this);
        this.handleDeckSelection = this.handleDeckSelection.bind(this);
        this.handleClearSelections = this.handleClearSelections.bind(this);
        this.handleSlide = this.handleSlide.bind(this);

        this.state = {
            decks: [{
                cards: [...Array(52).keys()],
            }],
            deckNumber: 0,
            view: 0,
            selectedCards: new Set(),
            mapping: Decks[0],
            cardWidth: 1.5,
            reversePos: null,
        };
    }

    indexToCard(index) {
        const mapping = this.state.mapping;
        // const mapping = Decks[0];
        return mapping[index];
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
            const deckIndex = document.getElementById("riffleSelect").selectedIndex;
            const currCardVals = this.state.mapping;
            const newMapping = Decks[deckIndex].map((card) => {return currCardVals.indexOf(card)});

            const orders = shuffleTo(deck, newMapping);

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
        const cardIndex = card.cardIndex;
        const cardVal = this.indexToCard(cardIndex);

        if (document.getElementById("selectAction").checked) {
            const selectedCards = this.state.selectedCards;
            selectedCards.has(cardVal) ? selectedCards.delete(cardVal) : selectedCards.add(cardVal);
            this.setState({
                selectedCards: selectedCards,
                reversePos: null,
            });
        } else if (document.getElementById("cutAction").checked) {
            const decks = this.state.decks;
            const deck = decks[decks.length - 1].cards;
            const pos = deck.indexOf(cardIndex);
            const cutDeck = cutAt(deck, pos);

            this.setState({
                decks: decks.concat([{
                    cards: cutDeck,
                }]),
                deckNumber: this.state.deckNumber + 1,
                view: this.state.deckNumber + 1,
                reversePos: null,
            });
        } else if (document.getElementById("reverseAction").checked) {
            const decks = this.state.decks;
            const deck = decks[decks.length - 1].cards;

            if (this.state.reversePos !== null) {
                const pos1 = this.state.reversePos;
                const pos2 = deck.indexOf(cardIndex);

                const reversedDeck = reverseBetween(deck, pos1, pos2);

                this.setState({
                    decks: decks.concat([{
                        cards: reversedDeck,
                    }]),
                    deckNumber: this.state.deckNumber + 1,
                    view: this.state.deckNumber + 1,
                    reversePos: null,
                });
            } else {
                const reversePos = deck.indexOf(cardIndex);
                this.setState({
                    reversePos: reversePos,
                });
            }
        }

    }

    handleDeckSelection() {
        const deckIndex = document.getElementById("orderSelect").selectedIndex;
        const newMapping = Decks[deckIndex];
        this.setState({
            decks: [{
                cards: [...Array(52).keys()],
            }],
            deckNumber: 0,
            view: 0,
            selectedCards: new Set(),
            mapping: newMapping,
        })
    }

    handleClearSelections() {
        this.setState({
            selectedCards: new Set(),
        })
    }

    handleSlide(event) {
        const val = event.target.value;

        this.setState({
            cardWidth: val,
        })
    }
    
    render() {
        const decks = this.state.decks;

        const shuffles = decks.map((deck, deckNumber) => {
            return (
                <div className="deck">
                    <Deck 
                        cards={deck.cards} 
                        deckNumber={deckNumber} 
                        indexToCard={this.indexToCard} 
                        handleCardClick={this.handleCardClick}
                        cardWidth={this.state.cardWidth}
                    />
                </div>
              );
        })

        return (
            <div className="game">
                <div className="instructions">
                    <h3>Shuffle Visualizer</h3>
                    <p>Instructions: Below is a deck of cards and several shuffle buttons. Click on a card to select it, allowing you to track its path through the shuffles.</p>
                </div>
                <div className="controls">
                    <div>
                        <label>Starting order: </label>
                        <select id="orderSelect" onChange={() => this.handleDeckSelection("orderSelect")}>
                            <option id="selection-NDO">NDO</option>
                            <option id="selection-CHSD">CHSD</option>
                            <option id="selection-Mnemonica">Mnemonica</option>
                        </select>
                    </div>
                    
                    <span className="shuffleButtons">
                        

                        <button className="shuffleButton" onClick={() => this.shuffle("riffle")}>Riffle</button>
                        <button className="shuffleButton" onClick={() => this.shuffle("outFaro")}>Out Faro</button>
                        <button className="shuffleButton" onClick={() => this.shuffle("inFaro")}>In Faro</button>
                        <button className="shuffleButton" onClick={() => this.shuffle("antiFaro")}>Anti-Faro</button>
                        <button className="shuffleButton" onClick={() => this.shuffle("fisherYates")}>Fisher-Yates</button>

                        <button className="shuffleButton" onClick={() => this.shuffle("shuffleTo")}>Riffle to:</button>
                        <select id="riffleSelect">
                            <option id="selection-NDO">NDO</option>
                            <option id="selection-CHSD">CHSD</option>
                            <option id="selection-Mnemonica">Mnemonica</option>
                        </select>
                        <button className="shuffleButton" onClick={this.handleClearSelections}>Clear Selections</button>

                        <input type="radio" name="clickAction" id="selectAction" value="selectAction" defaultChecked/>
                        <label htmlFor="selectAction">Select</label>
                        <input type="radio" name="clickAction" id="cutAction" value="cutAction"/>
                        <label htmlFor="cutAction">Cut</label>
                        <input type="radio" name="clickAction" id="reverseAction" value="reverseAction"/>
                        <label htmlFor="reverseAction">Reverse</label>

                        <Slider handleChange={this.handleSlide}></Slider>
                    </span>
                </div>
                
                <Xwrapper>
                    <ScrolledDiv className="deck-container">
                        <ol >{shuffles}</ol>

                    </ScrolledDiv >
                    <Lines decks={this.state.decks} selectedCards={this.state.selectedCards} indexToCard={this.indexToCard}></Lines>
                </Xwrapper>
                

                {/* <div className="deck-view">
                    <Deck 
                        cards={viewDeck} 
                        deckNumber={view} view={true} 
                        indexToCard={this.indexToCard} 
                        handleCardClick={this.handleCardClick} 
                        cardWidth={this.state.cardWidth}
                    />
                </div> */}
                


            </div>
        );
    }
}
  
  // ========================================
  
  ReactDOM.render(
    <App />,
    document.getElementById('root')
  );
  


function cardToImage(card) {
    const suit = card[card.length - 1];
    const value = card.slice(0, card.length - 1)
    return "./card_imgs/" + value + suit + ".png";
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

// start and end must be in deck
function reverseBetween(deck, start, end) {
    // Make sure start <= end
    [start, end] = start <= end ? [start, end] : [end, start];

    const first = deck.slice(0, start);
    const reversed = deck.slice(start, end + 1).reverse();
    const last = deck.slice(end + 1);
    return first.concat(reversed.concat(last));
}

function cutAt(deck, pos) {
    const firstHalf = deck.slice(0, pos);
    const secondHalf = deck.slice(pos, deck.length);
    return secondHalf.concat(firstHalf);
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