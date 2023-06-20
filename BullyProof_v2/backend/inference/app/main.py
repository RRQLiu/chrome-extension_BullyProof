from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from fastapi.middleware.cors import CORSMiddleware
from transformers import AutoTokenizer, AutoModelForSequenceClassification, AutoConfig
import numpy as np
from scipy.special import softmax
import utils

app = FastAPI()
MODEL = f"cardiffnlp/roberta-base-offensive"
tokenizer = AutoTokenizer.from_pretrained(MODEL)
config = AutoConfig.from_pretrained(MODEL)
model = AutoModelForSequenceClassification.from_pretrained(MODEL)
# model.save_pretrained(MODEL)
# tokenizer.save_pretrained(MODEL)

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


class TwitterData(BaseModel):
    id: str
    text: str


@app.post("/predict/")
async def predict(twitter_data: List[TwitterData]):
    identifiers = [t.id for t in twitter_data]
    text = [t.text for t in twitter_data]
    preds = []
    for t in text:
        encoded_input = tokenizer(utils.preprocess(t), return_tensors="pt")
        output = model(**encoded_input)
        scores = output[0][0].detach().numpy()
        scores = softmax(scores)
        pred = config.id2label[np.argmax(scores, axis=0)]
        if pred.lower() == "offensive":
            preds.append(1)
        else:
            preds.append(0)
        print(scores)
    output = [{"id": i, "sentiment": p} for i, p in zip(identifiers, preds)]
    return output
