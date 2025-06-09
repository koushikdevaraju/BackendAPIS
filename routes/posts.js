const express = require('express');
const router = express.Router();
const Posts = require('../models/posts');
const cron = require('node-cron');

router.post('/createPost', async (req, res, next) => {
    try {

        const postExist = await Posts.find({title: req.body.title});
        if (postExist) {
            return res.status(400).json({
                error: 'Post title already exists'
            })
        }

        const newPost = new Posts({
            title: req.body.title, content: req.body.content, placeVisit: req.body.placeVisit
        });
        await newPost.save();
        return res.status(200).json({
            response: newPost
        })
    } catch (err) {
        return res.status(500).json({
            error: err
        })
    }
})


router.get('/getPosts', async (req, res, next) => {

    const page = req.query.page;
    const limit = req.query.limit;

    try {
        if (page && limit) {
            const posts = await Posts.find({status: true}).select('-placeVisit -__v')
                .skip((page * limit) - limit).limit(limit);

            const totalPages = await Posts.countDocuments({status: true});

            const result = await posts.map((post, index) => ({
                ['slNumber']: ((page * limit) - limit) + (index + 1), ...post.toObject()
            }));
            return res.status(200).json({
                results: result, currentPage: page, totalPages: totalPages
            })
        }
        const posts = await Posts.find({status: true}).select('-placeVisit -__v');
        const totalPages = await Posts.countDocuments({status: true});
        const result = await posts.map((post, index) => ({
            ['slNumber']: (index + 1), ...post.toObject()
        }));
        return res.status(200).json({
            results: result, totalPages: totalPages
        });
    } catch (err) {
        return res.status(500).json({
            error: err
        })
    }
});


router.get('/getPost/:postId', async (req, res, next) => {
    const postId = req.params.postId;
    try {
        const post = await Posts.findById(postId).populate({
            path: 'userId', select: ['name', 'email']
        });
        if (!post) {
            return res.status(404).json({
                error: 'Post not found!'
            })
        }
        return res.status(200).json({
            post: post
        });
    } catch (err) {
        return res.status(500).json({
            error: err
        })
    }
})


router.patch('/updatePost/:postId', async (req, res, next) => {

    const postId = req.params.postId;
    const body = req.body;
    let updates = {};

    body.forEach(data => {
        updates = {
            ...updates, [data.propName]: data.value
        }
    })

    try {
        const post = await Posts.findById(postId);
        if (!post) {
            return res.status(404).json({
                error: 'Post not found!'
            })
        }
        const updatedResult = await Posts.findByIdAndUpdate(postId, {
            $set: updates,
        }).exec();
        return res.status(200).json({
            updatedResult: 'Updated Details'
        })
    } catch (err) {
        return res.status(500).json({
            error: err
        })
    }
})


router.delete('/deletePost/:postId', async (req, res, next) => {
    const postId = req.params.postId;
    try {
        const post = await Posts.findById(postId);
        if (!post) {
            return res.status(404).json({
                error: 'Post not found!'
            })
        }
        const deleted = await Posts.findByIdAndUpdate(postId, {
            status: false
        });
        return res.status(200).json({
            updatedResult: 'Post deleted'
        })
    } catch (e) {
        return res.status(500).json({
            error: e
        });
    }
})


router.post('/migrate', async (req, res, next) => {
    try {
        const posts = await Posts.find();
        posts.map(async (post) => {
            post.userId = null;
            await post.save();
        });
        return res.status(200).json({
            posts: posts
        })
    } catch (err) {
        return res.status(500).json({
            error: err
        })
    }

})


router.post('/addPlace/:postId/:action', async (req, res, next) => {

    const postId = req.params.postId;
    const action = req.params.action;
    try {
        const post = await Posts.findById(postId);
        if (!post) {
            return res.status(404).json({
                error: 'Post not found!'
            })
        }

        if (action === 'add') {
            const places = req.body.places;
            post.placeVisit = [...post.placeVisit, ...places];
            await post.save();

            return res.status(200).json({
                updated: post
            })
        }

        if (action === 'update') {
            const places = req.body.places;
            places.forEach(pl => {
                post.placeVisit.map((place) => {
                    if (place._id.toString() === pl._id) {
                        place.placeName = pl.placeName;
                        place.landMark = pl.landMark;
                    }
                });
            });
            await post.save();
            return res.status(200).json({
                updated: post
            })
        }

        if (action === 'remove') {
            const places = req.body.places;
            places.forEach(place => {
                post.placeVisit = post.placeVisit.filter((pl) => pl._id.toString() !== place);
            })
            await post.save();
            return res.status(200).json({
                updated: post
            })
        }


    } catch (e) {
        return res.status(500).json({
            error: e
        });
    }

})

module.exports = router;
