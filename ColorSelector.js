/*
  A class that keeps track of the mana value of a certain color.
  This class does not care about its color; that is handled in Sketch/Strip.js.
  API:
    Constructor: initialize mana value. TODO consider initializing mana color?
    toggleColorOn: increments the mana value.
    decrementMV: decrements the mana value. TODO deselect → mana value = 0?
    getMV: returns the mana value. TODO return color as well?
*/

class ColorSelector {
    constructor() {
        // initialize the mana value
        this.on = false
    }

    // increments mana value
    toggleColor() {
        this.on = !this.on

        print("\n")

        cmcBuckets = {}
        for (let card of cardList) {
            /*
               Check if:
               type line is instant or
               oracle text includes Flash, but not lowercase flash
                   this is case-sensitive, so it should not register flashback
               and this has to be true, then the following has to be true:
               card's mana cost has any selected mana symbol inside
               CMV of mana pool is greater than or equal to card's cmc
                   Currently, CMV of current mana pool is just wMana
               card is colorless

               My current approach happens to handle Phyrexian mana because
               that's just {C/P}
            */

            // a dictionary of cards sorted into buckets of mana value. This
            // sounds a lot like the sorting algorithm that sorts values
            // with buckets, which is unique in that it only has an O(N)
            // runtime. (that's Radix sort)

            /*
                Check if the card is an instant or has titlecase Flash and is
                in the current mana pool's colors. Colorless cards are included.
            */
            if ((card['type_line'].indexOf("Instant") !== -1 ||
                card['keywords'].indexOf("Flash") !== -1)
            ) {

                // flag that checks if the card is within the current colors
                let notWithinColors = false
                // for every color list in the card's colors:
                for (let colorList of card["colors"]) {
                    // checks if a match between the color list and the
                    // currently selected colors is found during the next
                    // color list loop
                    let noMatch = true
                    for (let color of strip.colorsSelected()) {
                        // check if it's within the current colors
                        if ((colorList.includes(color))) {
                            noMatch = false
                            break
                        }
                    }

                    // make sure that there is a match and the color list
                    // is not empty (due to being the list associated with
                    // colorless mana). then exit the loop
                    if (noMatch && (colorList.length !== 0)) {
                        notWithinColors = true
                        break
                    }
                }

                if (notWithinColors) {
                    continue
                }

                let cmc = card['cmc']
                let cardOracle = card['oracle_text']

                /*
                    If the card's lowercase oracle text contains creature,
                    it's probably a combat trick. It is also likely a combat
                    trick if it says "any target". However, Essence Scatter
                    is not a combat trick, so I have to look out for that.

                    Examples: Thrill of Possibility is not a combat trick,
                    but Volt Charge is because it can target anything, not
                    just creatures.

                    The purpose of this is to eventually be part of a toggle
                    that only inputs cards that are a trick when toggled on.
                */

                // skip the card if the card oracle does not contain
                // "creature" or "any target" and the state is equal to
                // "tricks only"
                if (((cardOracle.toLowerCase().indexOf("creature") !== -1 ||
                        cardOracle.toLowerCase().indexOf("any target") !== -1) &&
                    state === 2)) {
                    // print the card name and its oracle, then avoid adding
                    // the card to the cards to be displayed
                    print(card["name"] + " is a trick. oracle: " + cardOracle)
                    continue
                }

                if ((!(cardOracle.toLowerCase().indexOf("creature") !== -1 ||
                        cardOracle.toLowerCase().indexOf("any target") !== -1) &&
                    state === 1)) {
                    // print the card name and its oracle, then avoid adding
                    // the card to the cards to be displayed
                    print(card["name"] + " is not a trick. oracle: " + cardOracle)
                    continue
                }

                // if a card has "affinity for" in its name, remove all the
                // colorless mana in its cost
                if (cardOracle.indexOf("Affinity for") !== -1) {
                    // mana color strings have the format {colorless}{color}...
                    let colorlessManaCost = int(card["mana_cost"][1])
                    cmc -= colorlessManaCost
                }

                    // if a card has cost reduction that isn't affinity, remove
                // the cost reduction's cmc from the CMC.
                else if (cardOracle.indexOf("This spell costs ") !== -1 &&
                    cardOracle.indexOf(" less to cast") !== -1) {
                    let indexOfLessToCast = cardOracle.indexOf(" less to" +
                        " cast") - 1
                    let indexOfSpellCosts = cardOracle.indexOf("This spell" +
                        " costs ") + "This spell costs ".length

                    // the mana string of the cost reduction's CMC
                    let manaString = cardOracle.slice(indexOfSpellCosts,
                        indexOfLessToCast)

                    let costReductionCMC = findCMC(manaString)

                    cmc -= costReductionCMC

                    // console.log(indexOfLessToCast, indexOfSpellCosts)
                }

                // If Convoke is in the card's oracle:
                if (cardOracle.indexOf("Convoke") !== -1) {
                    // make its CMC 0 because you can convoke a card until its
                    // mana cost becomes 0
                    cmc = 0
                }

                let cardText = loadImage(card['png'])
                let cardText2 = loadImage(card['png'])

                // initialize or get a CMC bucket.
                let targetBucket = cmcBuckets[str(cmc)] ?? []
                targetBucket.push([cardText, cardText2])
                cmcBuckets[str(cmc)] = targetBucket
                print(card["name"], card)
            }
        }
    }

    // returns the mana value.
    ifOn() {
        return this.on
    }
}
