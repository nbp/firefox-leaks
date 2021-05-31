var searchParams = new URLSearchParams(window.location.search);

// This function is used as a callback on every button which is in the page.
// When a button is clicked, the classes named `add-*` are added the `main >
// section` element. These are then use to display the content to be
// investigated by the user.
function on_click_callback(ev) {
    if (ev.target.tagName != "BUTTON") {
        return;
    }

    // Pack all visible articles at the top, such that any new content which
    // would be toggled next would always appear after the content which is
    // already displayed.
    let last_article = null;
    for (let article of document.getElementsByTagName("article")) {
        // see https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetParent
        if (article.offsetParent) {
            if (last_article && last_article.nextElementSibling !== article) {
                last_article.insertAdjacentElement('afterend', article);
            }
            last_article = article;
        }
    }


    let classes = [];
    for (let cl of ev.target.classList) {
        if (cl.startsWith("add-")) {
            classes.push(cl.replace(/^add-/, "met-"));
        }
    }

    // Apply classes and update the url.
    let met_tags = document.getElementsByClassName("add-to-met");
    for (let tag of met_tags) {
        for (let cl of classes) {
            tag.classList.add(cl);
            searchParams.append(cl, '1');
        }
    }

    window.location.search = searchParams;
}

function on_load_callback() {
    // Update classes based on the url.
    let met_tags = document.getElementsByClassName("add-to-met");
    for (let tag of met_tags) {
        for (let cl of searchParams.keys()) {
            tag.classList.add(cl);
        }
    }

    // Add event handler to every button.
    let buttons = document.getElementsByTagName("button");
    for (let b of buttons) {
        b.onclick = on_click_callback;
    }

    // Append <style> element to <head>
    let style = document.createElement('style');
    document.head.appendChild(style);

    // Add CSS rules to filter hide non-visited questions, and to highlight
    // selected answers.
    let art_classes = new Set();
    for (let article of document.getElementsByTagName("article")) {
        for (let cl of article.classList) {
            if (cl.startsWith("pre-")) {
                art_classes.add(cl.replace(/^pre-/, ""));
            }
        }
        for (let bt of article.getElementsByTagName("button")) {
            for (let cl of bt.classList) {
                if (cl.startsWith("add-")) {
                    article.classList.add(cl.replace(/^add-/, "pro-"));
                }
            }
        }
    }
    let sheet = style.sheet;
    for (let cl of art_classes) {
        // Unless requested, do not display sub-parts of the article.
        sheet.insertRule(`.pre-${cl} { display: none; }`, sheet.cssRules.length);
        // When the conditions are met, reveil the content.
        sheet.insertRule(`.met-${cl} > .pre-${cl} { display: block; }`, sheet.cssRules.length);
        sheet.insertRule(`.met-${cl} > article > button.pre-${cl} { display: inline-block; }`, sheet.cssRules.length);
        // If one of the button got clicked, then remove the green border.
        sheet.insertRule(`.met-${cl} > .pro-${cl} { border-left-color: #ddd; }`, sheet.cssRules.length);
        // If one of the button got clicked, highlight the clicked answer.
        sheet.insertRule(`.met-${cl} > article > .add-${cl} { background-color: limegreen; }`, sheet.cssRules.length);
    }

    let bt_classes = new Set();
    for (let bt of document.getElementsByTagName("button")) {
        for (let cl of bt.classList) {
            if (cl.startsWith("add-")) {
                bt_classes.add(cl.replace(/^add-/, ""));
            }
        }
    }

    let bt_not_art = new Set([...bt_classes].filter(cl => !art_classes.has(cl)));
    let art_not_bt = new Set([...art_classes].filter(cl => !bt_classes.has(cl)));
    for (cl of bt_not_art) {
        console.warn(`Class ${cl} is used by a button but does not have a matching article.`);
    }
    art_not_bt.delete("new");
    for (cl of art_not_bt) {
        console.warn(`Class ${cl} is used by an article, but no button can toggle it.`);
    }
}

on_load_callback();
