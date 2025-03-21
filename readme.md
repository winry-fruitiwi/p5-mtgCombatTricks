# p5-mtgCombatTricks
#### We forget combat tricks all the time in Magic games. Let's fix that!
This app allows the user to see a list of all the combat tricks in any set 
of colors, even if the opposing deck is five colors.

If you use DarkReader and other injection-based background changing 
extensions, please turn it off when viewing, or else for some reason the 
background will not display!

This project is heavily based off of mtgPrimer by Garrett Gardner but was 
started very recently so there are much fewer sets, and set selection was 
only recently implemented. It primarily uses p5.js to render most of the 
page on a p5.js canvas with very few web elements.

Here is a video demo of this project's functions. (oops I have no idea how 
to embed a video)

When running the sketch you can find a list of "instructions" giving hotkeys 
for functions like changing the color query.

W, U, B, R, G, and C change white, blue, black, red, green, and colorless 
mana. Colorless mana does not change anything but is included in case mana 
selection ever gets implemented. cody-berry's p5-mtgCombatTricks project 
implements this functionality already. 

There's a dropdown menu to change the set. You *have* to reload the page in 
order for this to take effect or else nothing will happen. Set data is 
stored in the local storage of your browser.