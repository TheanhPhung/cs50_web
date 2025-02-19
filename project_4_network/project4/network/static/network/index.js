function App() {
	const [posts, setPosts] = React.useState([]);
	const [updated, setUpdated] = React.useState(false);
	const [inputContent, setInputContent] = React.useState("");
	const [isEditing, setIsEditing] = React.useState(false);
	const [postId, setPostId] = React.useState(null);

	React.useEffect(() => {
		fetch("/posts/")
		.then(response => response.json())
		.then(data => {
			setPosts(data);
			setUpdated(true);
		}) 
	}, [!updated]);

	const [showAlert, setShowAlert] = React.useState(false);

	if (showAlert === true) {
		setTimeout(() => {
			setShowAlert(false);
		}, 6000);
	}

	return (
		<div>
			<AlertSuccess showAlert={showAlert} />
			<NewPostForm 
				posts={posts} 
				setPosts={setPosts} 
				setUpdated={setUpdated} 
				setShowAlert={setShowAlert} 
				isEditing={isEditing} 
				setIsEditing={setIsEditing} 
				postId={postId}
			/>
			<ViewPosts 
				posts={ posts } 
				setPosts = {setPosts}
				setIsEditing={setIsEditing} 
				setUpdated={setUpdated}
				setPostId={setPostId}
			/>
		</div>
	)
}

async function getUserId() {
	const response = await fetch("/me/");
	const me = await response.json();
	return me.id;
};

function AlertSuccess({ showAlert }) {
	return showAlert ? (
		<div className="alert alert-success" role="alert" id="alert-success">
			New post has been updated successfully!
		</div>
	) : null;
}

function NewPostForm({ posts, setPosts, setUpdated, setShowAlert, isEditing, setIsEditing, postId }) {

	async function handleFormSubmit(event) {
		event.preventDefault();

		const content = event.target.elements.content.value;
		const userId = await getUserId();

		if (isEditing) {
			fetch("/editpost/", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-CSRFToken": document.cookie.split("=")[1]
				}, 
				body: JSON.stringify({
					origin: postId,
					new_content: content,
				})
			})

			const response = await fetch(`/posts/${postId}/`);
			const editedPost = await response.json();

			setPosts(prevPosts => [
				editedPost,
				...prevPosts.filter(post => post.id !== postId)
			]);

			setUpdated(false);
			event.target.elements.content.value = "";

			setIsEditing(false);

			const editedElement = document.getElementById(`${postId}`);
			setTimeout(() => editedElement.scrollIntoView(), 1500);
			
		} else {
			const response =  await fetch("/posts/", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-CSRFToken": document.cookie.split("=")[1]
				},
				body: JSON.stringify({
					owner: userId,
					content: content
				})
			})

			const newPost = await response.json();
			console.log("New post: ", newPost);

			setPosts([...posts, newPost]);
			console.log(posts);

			setUpdated(false);
			event.target.elements.content.value = "";

			setShowAlert(true);
		}
	}

	return (
		<div>
			<div className="container-fluid card p-3 m-2">
				<form className="form-group" onSubmit={handleFormSubmit}>
					<label className="form-label" forhtml="content">New Post</label>
					<textarea className="form-control" id="content" name="content" rows="3" required></textarea>
					<button className="btn btn-primary mt-2" type="submit">Post</button>
				</form>
			</div>
			<hr/>
		</div>
	)
}

function Post({ post, posts, setPosts, setIsEditing, setPostId, setUpdated }) {
	const [likeCount, setLikeCount] = React.useState(post.like_count);
	const [likeButtonName, setLikeButtonName] = React.useState("Like");
	const [likeButtonClassName, setLikeButtonClassName] = React.useState("btn btn-secondary me-3");
	const [likeIconClassName, setLikeIconClassName] = React.useState("fa fa-thumbs-up");
	const [isOwner, setIsOwner] = React.useState(false);
	const [comments, setComments] = React.useState([]);
	const [commentCount, setCommentCount] = React.useState(post.comment_count);
	const [showComment, setShowComment] = React.useState(false);

	React.useEffect(() => {
		async function updateButton() {
			const userId = await getUserId();
			const response = await fetch(`/users/${userId}/`);
			const data = await response.json();
			const likedPostsList = await data.liked_posts;

			// Update Like/Unlike button, Icon for button
			if (likedPostsList.includes(post.id)) {
				setLikeButtonName("Unlike");
				setLikeButtonClassName("btn btn-primary me-3");
				setLikeIconClassName("fa fa-thumbs-down");
			}

			if (post.owner === userId) {
				setIsOwner(true);
			}
		}
		updateButton();
	}, []);

	async function handleLikeClick() {
		const userId = await getUserId();
		const isLiked = likeButtonName === "Unlike";

		console.log("Like click! ", post.id);
		if (!isLiked) {
			fetch("/likes/", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-CSRFToken": document.cookie.split("=")[1]
				},
				body: JSON.stringify({
					liker: userId,
					post: post.id
				})
			})

			setLikeButtonName("Unlike");
			setLikeButtonClassName("btn btn-primary me-3");
			setLikeIconClassName("fa fa-thumbs-down");
			setLikeCount(likeCount + 1);
		} else {
			const like_response = await fetch(`/get-like/user=${userId}/post=${post.id}/`);
			const like_id_data = await like_response.json();
			const like_id = like_id_data.id;

			fetch(`/likes/${like_id}/`, {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
					"X-CSRFToken": document.cookie.split("=")[1]
				}
			});

			setLikeButtonName("Like");
			setLikeButtonClassName("btn btn-secondary me-3");
			setLikeIconClassName("fa fa-thumbs-up");
			setLikeCount(likeCount - 1);
		}
	}

	async function handleComment() {
		console.log("Comment button is clicked for:", post.content);
		if (!showComment) {
			setShowComment(true);
		} else {
			setShowComment(false);
		}
	}

	React.useEffect(() => {
		if (!showComment) return;

		async function fetchComments() {
			const response = await fetch(`/comments/${post.id}/`);
			const commentsList = await response.json();
			setComments(commentsList);
		}

		if (showComment) {
			fetchComments();
		}
	}, [showComment]);

	async function sendComment(event) {
		event.preventDefault();

		const content = event.target.elements.comment.value;
		const userId = await getUserId();
		const response = await fetch(`/comments/${post.id}/`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-CSRFToken": document.cookie.split("=")[1]
			},
			body: JSON.stringify({
				commenter: userId,
				post: post.id,
				content: content
			}) 
		});
		const newComment = await response.json();
		setComments([newComment, ...comments]);
		setCommentCount(commentCount + 1);

		event.target.elements.comment.value = "";
	}

	function handleEdit() {
		console.log("Edit button is clicked for:", post.content);
		const inputContent = document.querySelector("#content");
		inputContent.value = post.content;
		inputContent.scrollIntoView();
		inputContent.focus();
		setIsEditing(true);
		setPostId(post.id);
	}

	async function showProfile() {
		console.log(`Profile for ${post.owner_name}`);
		const owner = post.owner;
		const userId = await getUserId();
		setPosts(prevPosts => [
			...prevPosts.filter(post => post.owner === owner)
		]);
		//setUpdated(true);
	}

	const postClassName = "container-fluid card p-3 m-2 post";

	let d;

	if (post.updated_at) {
		d = new Date(post.updated_at);
	} else {
		d = new Date(post.created_at);
	}

	const formattedDate = d.toLocaleString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: true
	});

	return (
		<div className={postClassName} id={post.id}>
			<div className="card-header d-flex flex-row justify-content-between">
				<div className="flex-item">
					<h6><strong><span onClick={showProfile}>{post.owner_name}</span></strong></h6>
				</div>
				{isOwner  && (
				<div className="flex-item">
					<div className="d-flex flex-row justify-content-end">
						<div className="flex-item">
							<button className="btn btn-primary" onClick={handleEdit}><i className="fa fa-edit"></i> Edit</button>
						</div>
					</div>
				</div>
				)}
			</div>

			<div className="card-body">
				<p>{ post.edited_content ? post.edited_content : post.content }</p>
			</div>

			<div style={{ fontStyle: "italic", marginBottom: "10px" }}>
				{likeCount} {likeCount == 1 ? "person likes" : "people like"} this content
			</div>

			<div className="card-item row">
				<div className="col-sm-8 d-flex flex-row">
					<div className="flex-item">
						<button className={likeButtonClassName} onClick={handleLikeClick}><i className={likeIconClassName}></i> {likeButtonName}</button>
					</div>
					<div className="flex-item">
						<button className="btn btn-secondary" onClick={handleComment}><i className="fa fa-comment"></i> {commentCount} Comment</button>
					</div>
				</div>
				<div className="col-sm-4 d-flex flex-row justify-content-end">
					<div className="flex-item" style={{ color: "grey", textAlign: "right" }}>{post.edited_content ? "Updated" : "Created"} at { formattedDate }</div>
				</div>
			</div>
			{showComment && (
				<div className="m-2">
					<form onSubmit={sendComment}>
						<textarea className="form-control mb-2" id="comment" name="comment"></textarea>
						<button className="btn btn-primary" type="submit"><i className="fa fa-paper-plane"></i> Send</button>
					</form>
				</div>
			)}
			{showComment && (comments.map((comment) => (
				<div className="card mb-2 p-3 comment-card" key={comment.id}>
					<p><i><strong>{comment.commenter_name}</strong> said:</i> {comment.content}</p>
					<p className="ms-5" style={{ color: "grey" }}><i>at {comment.commented_at}</i></p>
				</div>
			)))}
		</div>
	)
}

function ViewPosts({ posts, setPosts, setIsEditing, setPostId, setUpdated }) {
	return posts.map(post => 
		<Post 
			post={post}
			posts={posts} 
			setPosts={setPosts}
			setPostId={setPostId}
			setIsEditing={setIsEditing}
			setUpdated={setUpdated}
			key={ post.id }
		/>
	);
}

const root = ReactDOM.createRoot(document.querySelector("#root"));
root.render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
)
