# Programmer: Bern Ernest Balbido

import random
import threading
import time

letter_to_number = {
    'A': 1,  'B': 2,  'C': 3,  'D': 4,  'E': 5,
    'F': 6,  'G': 7,  'H': 8,  'I': 9,  'J': 10,
    'K': 11, 'L': 12, 'M': 13, 'N': 14, 'O': 15,
    'P': 16, 'Q': 17, 'R': 18, 'S': 19, 'T': 20,
    'U': 21, 'V': 22, 'W': 23, 'X': 24, 'Y': 25,
    'Z': 26
}

word_list = [
    "CAT", "DOG", "SUN", "HAT", "CUP", "FAN", "MAP", "RUN",
    "JAM", "LOG", "NET", "PAN", "RAT", "TAP", "VAN", "YAM",
    "JUMP", "FROG", "CAKE", "FACE", "HINT", "JOKE", "KEEP",
    "LIME", "NOSE", "PINK", "ROSE", "SAFE", "TIME", "WAVE",
    "APPLE", "BRAVE", "DANCE", "EAGLE", "FLAME", "HAPPY",
    "LIGHT", "MAGIC", "NIGHT", "OCEAN", "QUEEN", "RIVER",
    "SMILE", "TIGER", "WATER", "ZEBRA"
]

def encode(word):
    return [letter_to_number[letter] for letter in word]

def show_table():
    print("\nREFERENCE TABLE:")
    print("A=1  B=2  C=3  D=4  E=5  F=6  G=7  H=8  I=9  J=10")
    print("K=11 L=12 M=13 N=14 O=15 P=16 Q=17 R=18 S=19 T=20")
    print("U=21 V=22 W=23 X=24 Y=25 Z=26\n")

def get_answer_with_timer():
    answer = [None]
    timed_out = [False]

    def ask():
        try:
            answer[0] = input("Your answer: ").strip().upper()
        except:
            answer[0] = ""

    t = threading.Thread(target=ask, daemon=True)
    t.start()

    for seconds_left in range(10, 0, -1):
        if answer[0] is not None:
            break
        print(f"\rTime left: {seconds_left}s ", end="", flush=True)
        time.sleep(1)

    print()

    if answer[0] is None:
        timed_out[0] = True

    return answer[0], timed_out[0]

def play():
    print("==============================")
    print("      NUMBER DECODER GAME")
    print("   by Bern Ernest Balbido")
    print("==============================")
    print("Decode the number codes into the correct word.")
    print("10 rounds | 3 lives | 10 seconds per round")

    show_table()
    input("Press ENTER to start...")

    score = 0
    lives = 3
    pool = word_list.copy()

    for round_num in range(1, 11):
        print("\n==============================")
        print(f"Round {round_num}/10  |  Lives: {lives}  |  Score: {score}")
        print("==============================")

        word = random.choice(pool)
        pool.remove(word)

        code = encode(word)
        print(f"\nCode: {' - '.join(str(n) for n in code)}")
        print(f"({len(word)} letters)\n")

        answer, timed_out = get_answer_with_timer()

        if timed_out or answer is None or answer == "":
            lives -= 1
            print(f"Time's up! The word was: {word}")
        elif answer == word:
            score += 1
            print(f"Correct! +1 point")
        else:
            lives -= 1
            print(f"Wrong! The word was: {word}")

        print(f"Lives: {lives}  |  Score: {score}")

        if lives == 0:
            print("\nYou ran out of lives! Game over.")
            break

        if round_num < 10:
            input("\nPress ENTER for the next round...")

    print("\n==============================")
    print(f"  GAME OVER! Final Score: {score}/10")
    if score == 10:
        print("  Perfect score! Amazing!")
    elif score >= 7:
        print("  Great job!")
    elif score >= 4:
        print("  Not bad, keep practicing!")
    else:
        print("  Better luck next time!")
    print("==============================")

play()
