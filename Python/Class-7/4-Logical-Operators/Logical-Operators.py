# email = "user@gmail.com"
# password = "123456"

# correct_email = "user@gmail.com"
# correct_password = "123456"

# email = input("Enter your email: ")
# password = input("Enter your password: ")

# if email == correct_email or password == correct_password:
#     print("Login successful")
# else:
#     print("Invalid email or password")




# email = input("Enter your email: ")
# password = input("Enter your password: ")

# if email == correct_email and password == correct_password:
#     print("Login successful")
# else:
#     print("Invalid email or password")




num1 = int(input("Enter first number: "))
operator = input("Enter operator (+, -, x, /, %): ")
num2 = int(input("Enter second number: "))

if operator == "+":
    print(num1 + num2)
elif operator == "-":
    print(num1 - num2)
elif operator == "x":
    print(num1 * num2)
elif operator == "/":
    print(num1 / num2)
elif operator == "%":
    print((num1 / num2) * 100)