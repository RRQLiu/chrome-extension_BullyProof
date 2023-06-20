from fastapi import FastAPI, Depends
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Union
from fastapi.middleware.cors import CORSMiddleware
import urllib3
from urllib.parse import urlencode
from config import Settings
from functools import lru_cache
import db
import json
import tweepy
from enum import Enum
import time

app = FastAPI()

origins = [
    "*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def generate_html_response():
    # html_content = """
    # <html>
    #     <head>
    #         <title>BullyProof</title>
    #     </head>
    #     <body>
    #         <h1>Thanks for signing-in! </h1>
    #     </body>
    # </html>
    # """
    # file = open('./temp_frontend/thankYou.html')
    return FileResponse("./temp_frontend/thankYou.html")


@lru_cache()
def get_settings():
    return Settings()


http = urllib3.PoolManager()

app.mount("/css", StaticFiles(directory="./temp_frontend/css"), name="css")
app.mount("/images", StaticFiles(directory="./temp_frontend/images"), name="images")


class UserData(Enum):
    BLOCKED = "blocked"
    MUTED = "muted"
    FOLLOWING = "following"


@app.get("/userInfo/{mode}")
async def getUserInfo(user_id: str, mode: UserData):
    time_last_pinged = db.get_time_created(user_id=user_id)['data']['time_created']
    if time_last_pinged != None:
        # rate limit @ 1 twitter api req per 15 seconds
        if (time.time() // 1) - time_last_pinged < 15:
            return {
                "data":{
                    "rate_limit":True
                },
                "message":"rate limit of 15 seconds; too many requests",
                "status":300,
            }
    res = db.get_user_token(user_id)
    db.update_time_created(user_id,(time.time() // 1))
    if res["status"] == 200:
        res2 = db.get_user_twitter_user_id(user_id,)
        twitter_user_id = res2["data"]["twitter_user_id"]
        token = res["data"]["token"]
        client = tweepy.Client(token)
        if mode == UserData.BLOCKED:
            data = client.get_users_following(
                id=twitter_user_id, user_fields=["profile_image_url", "url"]
            )
        elif mode == UserData.FOLLOWING:
            data = client.get_users_following(
                id=twitter_user_id, user_fields=["profile_image_url", "url"]
            )
        return {"data": data, "status": 200, "message": "successful info look up"}
    else:
        return res


# https://twitter.com/i/oauth2/authorize?response_type=code&client_id=aTBraVVTSHktUmE1ZHVGRXQ0YXo6MTpjaQ&redirect_uri=http://127.0.0.1:8000/api/token&scope=tweet.read%20mute.read%20users.read%20follows.read%20follows.write&state=state&code_challenge=challenge&code_challenge_method=plain
@app.get("/api/token")
async def token(
    code: str,
    state: Union[str, None] = None,
    settings: Settings = Depends(get_settings),
):
    url = "https://api.twitter.com/2/oauth2/token?"
    queryParams = urlencode(
        {
            "grant_type": "authorization_code",
            "client_id": settings.client_id,
            "redirect_uri": settings.redirect_uri,
            "code_verifier": settings.code_challenge,
            "code": code,
        }
    )
    req = url + queryParams
    r = http.request("POST", req)
    token = json.loads(r.data.decode("utf-8"))["access_token"]
    client = tweepy.Client(token)
    twitter_user_id = client.get_me(user_auth=False).data["id"]
    # replace later with real user_id
    user_id = state
    print(db.update_user(user_id ,twitter_user_id=twitter_user_id, token=token))
    return generate_html_response()


@app.get("/api/twitter-url")
def getTwitterURL(settings: Settings = Depends(get_settings)):
    # oauth2_user_handler = tweepy.OAuth2UserHandler(
    #     client_id=settings.client_id,
    #     redirect_uri=settings.redirect_uri,
    #     scope=settings.scope,
    # )
    d = {
        "response_type": "code",
        "client_id": settings.client_id,
        "redirect_uri":settings.redirect_uri,
        "scope": settings.scope,
        "code_challenge": "challenge",
        "code_challenge_method": "plain",
    }

    def generateUrl():
        ret = ""
        for (key, value) in d.items():
            ret += f"{key}={value}&"
        return ret[:-1]  # get rid of last &

    url = generateUrl()
    # print(url)
    return {"data": {"twitter_url": f"https://twitter.com/i/oauth2/authorize?{url}"}}


@app.get("/")
async def root(settings: Settings = Depends(get_settings)):
    return settings
