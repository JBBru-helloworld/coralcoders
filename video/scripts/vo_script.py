"""
The advert script: one source for the voiceover pipeline.

The owner records each line (recordings/line-N.m4a); the words follow those
recordings, ad-libs included. For every line:

words:    (subtitle word, what is said) pairs, in order. The subtitle word is
          shown on screen (UK English, no em dashes); the spoken form is what
          the transcript is matched against, with alternatives split by "|"
          (for example "s q l|sequel").
kinetic:  the big type for the shot ("" for none); "/" separates beats.
pause:    seconds of silence before the line in the assembled timeline.
"""

LINES: dict[int, dict] = {
    1: {
        "words": [("Every", "every"), ("big", "big"), ("idea", "idea"), ("starts", "starts"), ("small.", "small")],
        "kinetic": "starts small.",
        "pause": 0.8,
    },
    2: {
        "words": [
            ("Whether", "whether"), ("that's", "that s"), ("a", "a"), ("loop,", "loop"), ("a", "a"), ("sprite,", "sprite"),
            ("or", "or"), ("one", "one"), ("line", "line"), ("of", "of"), ("code.", "code"),
        ],
        "kinetic": "A loop. / A sprite. / One line of code.",
        "pause": 0.5,
    },
    3: {
        "words": [("But", "but"), ("then,", "then"), ("it", "it"), ("grows.", "grows")],
        "kinetic": "it grows.",
        "pause": 0.5,
    },
    4: {
        "words": [
            ("Coral", "coral"), ("Coders.", "coders"), ("Live", "live"), ("1:1", "one to one"),
            ("coding", "coding"), ("lessons,", "lessons"), ("online.", "online"),
        ],
        "kinetic": "Coral Coders",
        "pause": 1.4,
    },
    5: {
        "words": [
            ("Scratch", "scratch"), ("from", "from"), ("6.", "six"),
            ("Python", "python"), ("from", "from"), ("9.", "nine"),
            ("AI", "a i"), ("from", "from"), ("12.", "twelve"),
        ],
        "kinetic": "6+ / 9+ / 12+",
        "pause": 0.6,
    },
    6: {
        "words": [
            ("And", "and"), ("for", "for"), ("adults,", "adults"), ("we", "we"), ("even", "even"), ("have", "have"),
            ("Python,", "python"), ("SQL", "s q l|sequel"), ("and", "and"), ("AI.", "a i"),
        ],
        "kinetic": "Python. SQL. AI.",
        "pause": 0.5,
    },
    7: {
        "words": [
            ("All", "all"), ("taught", "taught|talked"), ("by", "by"), ("a", "a"), ("software", "software"), ("engineer", "engineer"),
            ("who", "who"), ("builds", "builds"), ("with", "with"), ("AI", "a i"), ("every", "every"), ("day.", "day"),
        ],
        "kinetic": "",
        "pause": 0.6,
    },
    8: {
        "words": [
            ("And", "and"), ("your", "your"), ("first", "first"), ("lesson", "lesson"), ("is", "is"),
            ("absolutely", "absolutely"), ("free.", "free"),
        ],
        "kinetic": "Your first lesson is absolutely free.",
        "pause": 1.2,
    },
    9: {
        "words": [
            ("Visit", "visit"), ("coralcoders.com", "coral coders dot com"),
            ("today", "today"), ("to", "to"), ("sign", "sign"), ("up.", "up"),
        ],
        "kinetic": "Visit / coralcoders.com / today to sign up.",
        "pause": 0.7,
    },
}


def subtitle(n: int) -> str:
    return " ".join(word for word, _ in LINES[n]["words"])
