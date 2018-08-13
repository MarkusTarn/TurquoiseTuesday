'use latest';
import bodyParser from 'body-parser';
import express from 'express';
import Webtask from 'webtask-tools';
import { MongoClient } from 'mongodb';

const database = 'turquoise';
const collection = 'my-collection';
const server = express();

server.use(
    bodyParser.urlencoded({
        extended: true,
    })
);
server.use(bodyParser.json());

server.post('/retro', (req, res, next) => {
    const { MONGO_URL } = req.webtaskContext.secrets;
    const userId = req.body.user_id;

    MongoClient.connect(MONGO_URL, (connectionError, client) => {
        if (connectionError) return next(connectionError);

        const db = client.db(database);
        db.collection(collection).findOne({ _id: userId }, (queryError, result) => {
            client.close();
            if (queryError) return next(queryError);

            const positiveResponse = [];
            const negativeResponse = [];
            const response = [];
            if (result && result.feelings) {
                result.feelings.forEach(feeling => {
                    if (feeling.mood)
                        if (feeling.mood === '+') positiveResponse.push(feeling);
                        else negativeResponse.push(feeling);
                    else response.push(feeling);
                });
                response.push({
                    fallback: 'Done with sprint?',
                    title: 'Done with sprint?',
                    callback_id: 'delete',
                    attachment_type: 'default',
                    actions: [
                        {
                            text: 'Hide',
                            name: 'action',
                            type: 'button',
                            value: 'hide',
                            style: 'info',
                        },
                        {
                            text: 'Clear sprint :recycle:',
                            name: 'action',
                            type: 'button',
                            value: 'delete',
                            style: 'danger',
                            confirm: {
                                title: 'Are you sure?',
                                ok_text: 'Yes',
                                dismiss_text: 'No',
                            },
                        },
                    ],
                });
            } else {
                response[0] = { text: 'no feelings found', color: '#B84510' };
            }
            return next(
                res.status(200).json({
                    text: "Here's an overview of last sprint:",
                    attachments: positiveResponse
                        .concat(negativeResponse)
                        .concat(response),
                })
            );
        });
    });
});

server.post('/feeling', (req, res, next) => {
    const { MONGO_URL } = req.webtaskContext.secrets;
    const timeStamp = Math.floor(new Date().getTime() / 1000);
    const userId = req.body.user_id;
    const text = req.body.text;

    if (text === '')
        return next(
            res.status(200).json({ text: 'Empty reminder text was sent!' })
        );
    const mood =
        text.charAt(0) === '+' || text.charAt(0) === '-' ? text.charAt(0) : null;
    const feeling = {
        text: mood ? text.substring(1) : text,
        mood: mood,
        ts: timeStamp,
    };
    if (mood) feeling.color = mood === '+' ? '#2eb886' : '#B84510';
    else feeling.color = '#C8B02F';

    MongoClient.connect(MONGO_URL, (connectionError, client) => {
        if (connectionError) return next(connectionError);

        const db = client.db(database);
        db
            .collection(collection)
            .findOne({ _id: userId }, (findQueryError, queryResult) => {
                if (findQueryError) return next(findQueryError);

                const feelings = queryResult ? queryResult.feelings : [];
                feelings.push(feeling);
                db
                    .collection(collection)
                    .save({ _id: userId, feelings }, (insertQueryError, result) => {
                        client.close();
                        if (insertQueryError) return next(insertQueryError);

                        return next(
                            res.status(200).json({
                                text: 'Retro reminder added:',
                                ts: timeStamp,
                                attachments: [feeling],
                            })
                        );
                    });
            });
    });
});

server.post('/actions', (req, res, next) => {
    const { MONGO_URL } = req.webtaskContext.secrets;
    const payload = JSON.parse(req.body.payload) || null;
    const action = payload.actions[0].value || null;

    if (payload.callback_id === 'delete') {
        if (action === 'delete') {
            MongoClient.connect(MONGO_URL, (connectionError, client) => {
                if (connectionError) return next(connectionError);

                const db = client.db(database);
                db
                    .collection(collection)
                    .deleteOne(
                        { _id: payload.user.id },
                        (deleteQueryError, queryResult) => {
                            client.close();
                            if (deleteQueryError) return next(deleteQueryError);

                            return next(res.status(200).json({ text: 'Sprint cleared!' }));
                        }
                    );
            });
        } else if (action === 'hide')
            return next(res.status(200).json({ text: 'Have a nice day!' }));
    } else return next(res.status(200).json({ text: 'Nothing was done!' }));
});

module.exports = Webtask.fromExpress(server);
