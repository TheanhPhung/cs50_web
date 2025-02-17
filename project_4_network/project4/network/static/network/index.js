function App() {
	const [posts, setPosts] = React.useState([]);
	const [updated, setUpdated] = React.useState(false);

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
			<NewPostForm posts={posts} setPosts={setPosts} setUpdated={setUpdated} setShowAlert={setShowAlert} />
			<ViewPosts posts={ posts } />
		</div>
	)
}

function AlertSuccess({ showAlert }) {
	return showAlert ? (
		<div className="alert alert-success" role="alert" id="alert-success">
			New post has been updated successfully!
		</div>
	) : null;
}

function NewPostForm({ posts, setPosts, setUpdated, setShowAlert }) {
	async function handleFormSubmit(event) {
		event.preventDefault();

		const content = event.target.elements.content.value;
		console.log("Form is submited!");
		console.log("Content = ", content);

		async function getUserId() {
			const response = await fetch("/me/");
			const me = await response.json();
			return me.id;
		};

		const userId = await getUserId();

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
		<div className="container-fluid card p-3 m-2">
			<form className="form-group" onSubmit={handleFormSubmit}>
				<label className="form-label" forhtml="content">New Post</label>
				<textarea className="form-control" id="content" name="content" rows="3"></textarea>
				<button className="btn btn-primary mt-2" type="submit">Post</button>
			</form>
		</div>
	)
}

function Post({ post, posts }) {
	function handleLike() {
		console.log("Like button is clicked for:", post.content);
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
			<div className="d-flex flex-row justify-content-between">
				<div className="flex-item">
					<h6><strong>{ post.owner_name }</strong></h6>
				</div>
				<div className="flex-item">
					<div className="d-flex flex-row justify-content-end">
						<div className="flex-item">
							<button className="btn btn-primary"><i className="fa fa-edit"></i> Edit</button>
						</div>
					</div>
				</div>
			</div>

			<div>
				<p>{ post.content }</p>
			</div>

			<div className="row">
				<div className="col-sm-8 d-flex flex-row">
					<div className="flex-item">
						<button className="btn btn-secondary me-3" onClick={handleLike}><i className="fa fa-thumbs-up"></i> Like</button>
					</div>
					<div className="flex-item">
						<button className="btn btn-secondary"><i className="fa fa-comment"></i> Comment</button>
					</div>
				</div>
				<div className="col-sm-4 d-flex flex-row justify-content-end">
					<div className="flex-item" style={{ color: "grey", textAlign: "right" }}>{ formattedDate }</div>
				</div>
			</div>
		</div>
	)
}

function ViewPosts({ posts }) {
	return posts.map(post => <Post post={ post } posts={ posts }  key={ post.id }/>);
}

const root = ReactDOM.createRoot(document.querySelector("#root"));
root.render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
)
