from policy_rag import initialize_database


try:
    result = initialize_database()

    print("MONGODB CONNECTION SUCCESSFUL")

    for key, value in result.items():
        if key != "connection":
            print(f"{key}: {value}")

    print("Connection:", result["connection"])

except Exception as error:

    print("MONGODB CONNECTION FAILED")
    print(type(error).__name__, str(error))