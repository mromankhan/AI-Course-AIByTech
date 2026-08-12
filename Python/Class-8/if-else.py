# num = int(input("Enter a number: "))

# if num % 2 == 0:
#     print(f"The number {num} is even")
# else:
#     print(f"The number {num} is odd")

# name = input("Enter your name: ")

# print("Welcome {name} to the calculator {2 + 2}")
# print()
# print(f"Welcome {name} to the calculator {2 + 2}")







num = int(input("Enter a number: "))

if num < 13:
    print(f"the user is child")
elif num >= 13 and num < 20:
    print(f"the user is teenager")
elif num >= 20 and num < 50:
    print(f"the user is adult")
else:
    print(f"the user is old person")