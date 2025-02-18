function App() {
	const [posts, setPosts] = React.useState([]);
	const [updated, setUpdated] = React.useState(false);
	const [inputContent, setInputContent] = React.useState("");
	const [isEditing, setIsEditing] = React.useState(false);

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
			<NewPostForm posts={posts} setPosts={setPosts} setUpdated={setUpdated} setShowAlert={setShowAlert} isEditing={isEditing} setIsEditing={setIsEditing} />
			<ViewPosts posts={ posts } setIsEditing={setIsEditing} />
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

function NewPostForm({ posts, setPosts, setUpdated, setShowAlert, isEditing, setIsEditing }) {

	async function handleFormSubmit(event) {
		event.preventDefault();

		const content = event.target.elements.content.value;
		const userId = await getUserId();

		if (isEditing) {
			console.log("Just edit, not update!");
			setIsEditing(false);
		}

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

	return (
		<div>
			<div className="container-fluid card p-3 m-2">
				<form className="form-group" onSubmit={handleFormSubmit}>
					<label className="form-label" forhtml="content">New Post</label>
					<textarea className="form-control" id="content" name="content" rows="3"></textarea>
					<button className="btn btn-primary mt-2" type="submit">Post</button>
				</form>
			</div>
			<hr/>
		</div>
	)
}

function Post({ post, posts, setIsEditing }) {
	const [likeCount, setLikeCount] = React.useState(post.like_count);
	const [likeButtonName, setLikeButtonName] = React.useState("Like");
	const [likeButtonClassName, setLikeButtonClassName] = React.useState("btn btn-secondary me-3");
	const [likeIconClassName, setLikeIconClassName] = React.useState("fa fa-thumbs-up");
	const [isOwner, setIsOwner] = React.useState(false);

	React.useEffect(() => {
		async function updateButton() {
			const userId = await getUserId();
			const response = await fetch(`/users/${userId}/`);
			const data = await response.json();
			const likedPostsList = await data.liked_posts;

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

	function handleComment() {
		console.log("Comment button is clicked for:", post.content);
	}

	function handleEdit() {
		console.log("Edit button is clicked for:", post.content);
		const inputContent = document.querySelector("#content");
		inputContent.value = post.content;
		inputContent.scrollIntoView();
		inputContent.focus();
		setIsEditing(true);
	}

	const isNewPost = (post.id == posts.length);
	const postClassName = `container-fluid card p-3 m-2 post ${isNewPost ? "newest-post" : ""}`;

	const d = new Date(post.created_at);
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
		<div className={postClassName}>
			<div className="card-header d-flex flex-row justify-content-between">
				<div className="flex-item">
					<h6><strong>{post.owner_name}</strong></h6>
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
				<p>{ post.content }</p>
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
						<button className="btn btn-secondary" onClick={handleComment}><i className="fa fa-comment"></i> {post.comment_count} Comment</button>
					</div>
				</div>
				<div className="col-sm-4 d-flex flex-row justify-content-end">
					<div className="flex-item" style={{ color: "grey", textAlign: "right" }}>{ formattedDate }</div>
				</div>
			</div>
		</div>
	)
}

function ViewPosts({ posts, setIsEditing }) {
	return posts.map(post => <Post post={ post } posts={ posts } setIsEditing={setIsEditing} key={ post.id }/>);
}

const root = ReactDOM.createRoot(document.querySelector("#root"));
root.render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
)
