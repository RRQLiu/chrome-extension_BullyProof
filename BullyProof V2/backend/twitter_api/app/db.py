import sqlite3
def update_time_created(user_id,time_created):
    con = sqlite3.connect("database.db")
    cur = con.cursor()
    sql = f'UPDATE token SET time_created={time_created} WHERE user_id="{user_id}"'
    cur.execute(sql)
    con.commit()
    con.close()

def get_time_created(user_id):
    con = sqlite3.connect("database.db")
    cur = con.cursor()
    sql = f'SELECT time_created FROM token where user_id="{user_id}"'
    res = cur.execute(sql)
    result = res.fetchone()
    con.close()
    if result == None:
        return {"data": {"time_created":None}, "status": 500, "message": "user does not exist"}
    # 60 * 5 for 300 seconds
    return {
        "data": {"time_created": result[0]},
        "status": 200,
        "message": "returned time safely",
    }
print(get_time_created(123))
def get_user_token(user_id):
    con = sqlite3.connect("database.db")
    cur = con.cursor()
    sql = f'SELECT token FROM token where user_id="{user_id}"'
    res = cur.execute(sql)
    result = res.fetchone()
    con.close()
    if result == None:
        return {"data": {}, "status": 500, "message": "user does not exist"}
    # 60 * 5 for 300 seconds
    return {
        "data": {"token": result[0]},
        "status": 200,
        "message": "returned token safely",
    }
def get_user_twitter_user_id(user_id):
    con = sqlite3.connect("database.db")
    cur = con.cursor()
    sql = f'SELECT twitter_user_id FROM token where user_id="{user_id}"'
    res = cur.execute(sql)
    result = res.fetchone()
    con.close()
    if result == None:
        return {"data": {}, "status": 500, "message": "user does not exist"}
    return {
        "data": {"twitter_user_id": result[0]},
        "status": 200,
        "message": "returned twitter_user_id safely",
    }


def create_user(user_id, twitter_user_id="NULL", token="NULL"):
    con = sqlite3.connect("database.db")
    cur = con.cursor()

    # must be token -> twitter id in the insert statement
    sql = f'INSERT INTO token VALUES("{user_id}", "{token}", "{twitter_user_id}", NULL)'
    if twitter_user_id == "NULL":
        sql = f'INSERT INTO token VALUES("{user_id}", NULL, NULL, NULL)'
    try:
        cur.execute(sql)
        con.commit()
        con.close()
        return {"data": {}, "status": 200, "message": "success create user"}
    except Exception as e:
        con.close()
        return {"data": {}, "status": 500, "message": f"error in creating user:\n{e}"}

def update_user(user_id, twitter_user_id, token):
    con = sqlite3.connect("database.db")
    cur = con.cursor()
    try:
        if get_user_token(user_id)['data'] == {}:
            con.close()
            print('creating user')
            return create_user(user_id, twitter_user_id=twitter_user_id, token=token)
        else:
            sql = f'UPDATE token SET token="{token}", twitter_user_id="{twitter_user_id}" WHERE user_id="{user_id}"'
            cur.execute(sql)
            con.commit()
            con.close()
            return {"data":{'updated':True},"message":"updated user; user was found", "status":200}
    except Exception as e:
        con.close()
        return {"data": {}, "status": 500, "message": f"error in updating user:\n{e}"}