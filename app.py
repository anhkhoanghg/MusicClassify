import os
import subprocess
from flask import Flask, jsonify, render_template, request, json
from os import system, chdir
import pandas as pd
import base64
import shutil
from pathlib import Path

import requests


app = Flask(__name__)
currentPath = os.getcwd()
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = ROOT_DIR.replace("\\", '/')
CODE_DIR = ROOT_DIR + "/backend"

PRED_DIR = CODE_DIR + "/data/others/"

substring = "data:audio/wav;base64,"
print(CODE_DIR)


@app.route('/', methods=['GET'])
def index1():
    return render_template('index.html',)


@app.route('/page/index', methods=['GET'])
def index2():
    return render_template('index.html')


@app.route('/page/main', methods=['GET'])
def main():
    return render_template('main.html')


@app.route('/main/processData/<file>', methods=['GET', 'POST'])
def processData(file):
    if request.method == 'POST':
    #     file = file.replace("~", "/")
    #     fileName = (file.split("/"))[1]
    #     fileURL = (file.split("/"))[2]

    #     ecodeURL = fileURL.replace("&forwardslash;", "/").replace(
    #         "&twodot;", ":").replace("&dot;", ".").replace("&minus;", "-")

    #     requestBlob = requests.get(ecodeURL)
    #     content = requestBlob.content

    #     print("test", requestBlob, content)

    #     createWav(fileName, base64.b64encode())

    #     chdir(CODE_DIR)
    #     returnValue = subprocess.check_output(
    #         "python3 cnn.py predict ./data/genres_original -f ./data/genres_original/" + file + " -m cnn64", shell=True)

    #     json_str = json.dumps({
    #         'type': (returnValue.decode('utf-8').split(","))[0],
    #         'probility': (returnValue.decode('utf-8').split(","))[1],
    #         "name": fileName
    #     })
    #     return json_str
        data = request.data
        data = json.loads(data)

        file = file.replace("~", "/")
        fileName = (file.split("/"))[1]

        createWav(fileName.split(".wav")[0], data["base64"])

        chdir(CODE_DIR)
        returnValue = subprocess.check_output(
            "python3 cnn.py predict ./data/genres_original -f ./data/" + file + " -m cnn64", shell=True)

        json_str = json.dumps({
            'type': (returnValue.decode('utf-8').split(","))[0],
            'probility': (returnValue.decode('utf-8').split(","))[1],
            "name": fileName
        })

        return json_str
    return ''


def createWav(fileNameWav, base64Wav):
    chdir(PRED_DIR)

    BASE64_CODE = base64Wav
    NAME = fileNameWav
    FILE = NAME + '.txt'

   # Create and write data to text file
    with open(os.path.join(os.getcwd(), FILE), 'w') as fp:
        fp.write(BASE64_CODE)

    # Read data from text file to variable
    base64_str = Path(FILE).read_text()

    # Remove if exist non-need strings in base64
    substring = r"data:audio/wav;base64,"
    res = base64_str.replace(substring, "")
    res = res.replace('"', "")

    # Create wav file from base64 variable
    wav_file = open(NAME+".wav", "wb")
    decode_string = base64.b64decode(res)
    wav_file.write(decode_string)

    # Clear base64 data from variable
    res = None
    deletefile()


def deletefile():
    folder = os.getcwd()
    for filename in os.listdir(folder):
        file_path = os.path.join(folder, filename)
        if ".txt" in file_path:
            try:
                if os.path.isfile(file_path) or os.path.islink(file_path):
                    os.unlink(file_path)
                elif os.path.isdir(file_path):
                    shutil.rmtree(file_path)
            except Exception as e:
                print('Failed to delete %s. Reason: %s' % (file_path, e))


@app.route('/page/aboutus', methods=['GET'])
def aboutus():
    return render_template('aboutus.html')


if __name__ == "__main__":
    app.run(debug=True)
