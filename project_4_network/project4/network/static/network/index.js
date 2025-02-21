function App() {
	const [pageNumber, setPageNumber] = React.useState(1);
	const [posts, setPosts] = React.useState([]);
	const [isLastPage, setIsLastPage] = React.useState(false);
	const [notifications, setNotifications] = React.useState(1);
	const [isEditing, setIsEditing] = React.useState(false);
	const [postId, setPostId] = React.useState(0);

	React.useEffect(() => {
		async function update() {
			const data = await getPosts(pageNumber);
			if (arePostsEqual(posts, data.results)) return;
			setPosts(data.results);
			setIsLastPage(data.count / pageNumber <= 10);
		}
		update();
	}, [pageNumber, posts]);

	return (
		<div className="container">
			<TitleBar notifications={notifications} />
			<NewPost 
				posts={posts} 
				setPosts={setPosts} 
				isEditing={isEditing} 
				setIsEditing={setIsEditing} 
				postId={postId}
			/>
			<ViewPosts posts={posts} setIsEditing={setIsEditing} setPostId={setPostId} />
			<LoadPageButton 
				pageNumber={pageNumber} 
				setPageNumber={setPageNumber} 
				posts={posts}
				isLastPage={isLastPage}
			/>
		</div>
	)
}

function arePostsEqual(oldPosts, newPosts) {
	if (oldPosts.length !== newPosts.length) return false;
	return oldPosts.every((post, index) => post.content === newPosts[index].content && post.id === newPosts[index].id);
}

async function getPosts(pageNumber) {
	const response = await fetch(`/posts/?p=${pageNumber}`);
	const data = await response.json();
	return data;
}

async function getMe() {
	const response = await fetch("/me/");
	const result = await response.json()
	return result.id
}

function ShowTitle() {
	return (
		<div>
			<span className="badge bg-light text-dark m-3"><h4 className="mt-2">All posts</h4></span>
		</div>
	)
}

function Notification({notifications}) {
	return (
		<div>
			<button className="btn btn-primary position-relative m-3">
				Notification
				<span 
					className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
				>
					{notifications > 0 ? notifications : null}
				</span>

			</button>
		</div>
	)
}

function TitleBar({notifications}) {
	return (
		<div>
			<div className="d-flex flex-row justify-content-between">
				<div className="flex-item">
					<ShowTitle />
				</div>
				<div className="flex-item">
					<Notification notifications={notifications}/>
				</div>
			</div>
			<hr />
		</div>
	)
}

function NewPost({posts, setPosts, isEditing, setIsEditing, postId}) {
	async function handleFormSubmit(event) {
		event.preventDefault();
		console.log("Form is submited!");

		const userId = await getMe();
		const content = event.target.elements.content.value;

		if (!isEditing) {
			const response = await fetch("/posts/", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-CSRFToken": document.cookie.split("=")[1]
				},
				body: JSON.stringify({
					"owner": userId,
					"content": content
				})
			});

			const newPost = await response.json();
			setPosts(prevPosts => [newPost, ...prevPosts]);
		} else {
			const response = await fetch (`/edit-post/${postId}/`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-CSRFToken": document.cookie.split("=")[1]
				},
				body: JSON.stringify({
					"origin": postId,
					"new_content": content
				})
			})

			const editedPost = await response.json();
			console.log(editedPost);
			const prevPosts = posts.slice();
			setPosts(prevPosts.map(post => post.id === postId ? editedPost : post));	
			setIsEditing(false);

			const focusContent = document.getElementById(`${postId}`);
			focusContent.scrollIntoView();
		}

		event.target.elements.content.value = "";
	}

	function handleCancel(event) {
		event.preventDefault();
		document.querySelector("#content").value = "";
		setIsEditing(false);
	}

	return (
		<div>
			<div className="container-fluid card p-3 m-2">
				<form className="form-group" onSubmit={handleFormSubmit}>
					<label className="form-label" forhtml="content">New Post</label>
					<textarea className="form-control" id="content" name="content" rows="3" required></textarea>
					<div className="d-flex flex-row justify-content-between">
						<button className={isEditing ? "flex-item btn btn-success mt-2" : "btn btn-primary mt-2"} type="submit">{isEditing ? "Save Edit" : "Post"}</button>
						{isEditing ? (<button className="btn btn-warning mt-2" onClick={handleCancel}>Cancel</button>) : null}
					</div>
				</form>
			</div>
			<hr/>
		</div>
	)
}

function ViewPost({ post, setIsEditing, setPostId }) {
	const [likeButtonClassName, setLikeButtonClassName] = React.useState("btn btn-secondary me-3 ms-3");
	const [likeCount, setLikeCount] = React.useState(post.like_count);
	const [commentCount, setCommentCount] = React.useState(post.comment_count);
	const [isLiked, setIsLiked] = React.useState(false);
	const [isOwnPost, setIsOwnPost] = React.useState(false);
	const [isUpdated, setIsUpdated] = React.useState(false);
	const [lastContent, setLastContent] = React.useState(post.content);
	const [lastUpdateTime, setLastUpdateTime] = React.useState(post.created_at);

	React.useState(() => {
		async function updateButton() {
			const userId = await getMe();
			const response = await fetch(`/likes/filter=check/user=${userId}/post=${post.id}/`);
			const data = await response.json();
			if (data.results.length > 0) {
				setIsLiked(true);
				setLikeButtonClassName("btn btn-primary me-3 ms-3");
			} else {
				setIsLiked(false);
				setLikeButtonClassName("btn btn-secondary me-3 ms-3");
			}
		}

		async function checkOwnerShip() {
			const userId = await getMe();
			setIsOwnPost(userId === post.owner);
		}

		async function checkIsUpdated() {
			const response = await fetch(`/edit-post/${post.id}/`);
			const data = await response.json();
			setIsUpdated(data.count > 0);
			if (data.count > 0) {
				const lastEdit = data.results[0];
				setLastContent(lastEdit.new_content);
				setLastUpdateTime(lastEdit.edited_at);
			}
		}

		checkOwnerShip();
		updateButton();
		checkIsUpdated();
	}, []);
	
	async function handleLikeClick() {
		console.log("Click on like button for post: ", post.id);
		const userId = await getMe();

		if (!isLiked) {
			setIsLiked(true);
			setLikeCount(likeCount + 1);
			setLikeButtonClassName("btn btn-primary me-3 ms-3");

			fetch("/likes/", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-CSRFToken": document.cookie.split("=")[1]
				},
				body: JSON.stringify({
					"liker": userId,
					"post": post.id
				})
			})
			.catch(error => console.log("Error in handleLikeClick function: ", error));
		} else {
			setIsLiked(false);
			setLikeCount(likeCount - 1);
			setLikeButtonClassName("btn btn-secondary me-3 ms-3");

			async function getLikeId() {
				const response = await fetch(`/likes/filter=check/user=${userId}/post=${post.id}/`);
				const data = await response.json();
				return data.results[0].id;
			}

			const likeId = await getLikeId();
			
			fetch(`/likes/${likeId}/`, {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
					"X-CSRFToken": document.cookie.split("=")[1]
				}
			})
			.catch(error => console.log("Error in handleLikeClick function: ", error));
		}
	}

	function handleCommentClick() {
		console.log("Click on comment button for post: ", post.id);
	}

	function handleEditClick(event) {
		console.log("Click on edit button for post: ", post.id);
		setPostId(post.id);
		setIsEditing(true);
		const contentInput = document.querySelector("#content");
		contentInput.value = lastContent;
		contentInput.focus();
	}

	const d = new Date(lastUpdateTime);
	const formatedDateTime = d.toLocaleString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	});


	return (
		<div className="container-fluid card p-3 m-3 post" id={post.id}>
			<div className="card-header">
				<div className="d-flex flex-row justify-content-between">
					<div className="flex-item">
						<h6 className="mt-2"><strong><span className="text-secondary owner-post">{post.owner_name}</span></strong></h6>
					</div>
					<div className="flex-item">
						{isOwnPost ? (<button className="btn btn-primary" onClick={handleEditClick}><i className="fa fa-edit"></i> Edit</button>) : null}
					</div>
				</div>
			</div>
			<div className="card-body container p-3">
				{lastContent}
			</div>
			<div className="d-flex flex-row justify-content-between">
				<div className="flex-item">
					<button className={likeButtonClassName} onClick={handleLikeClick}><i className="fa fa-thumbs-up"></i> {likeCount} Like{likeCount > 1 ? "s": ""}</button>
					<button className="btn btn-secondary" onClick={handleCommentClick}><i className="fa fa-comment"></i> {commentCount} Comment{commentCount > 1 ? "s": ""}</button>
				</div>
				<div className="flex-item me-3 text-secondary">{formatedDateTime}</div>
			</div>
		</div>
	)
}

function ViewPosts({ posts, setIsEditing, setPostId }) {
	return posts.map(post => 
		<ViewPost post={post} setIsEditing={setIsEditing} setPostId={setPostId} key={post.id} />
	);
}

function LoadPageButton({ pageNumber, setPageNumber, posts, isLastPage }) {
	const headSection = document.querySelector("#content");

	function prevPage() {
		setPageNumber(pageNumber - 1);
		headSection.scrollIntoView();
	}

	function nextPage() {
		setPageNumber(pageNumber + 1);
		headSection.scrollIntoView();
	}

	return (
		<div className="d-flex flex-row justify-content-center mt-3">
			{pageNumber > 1 ? (
			<div>
				<button className="btn btn-light m-3 load-button" onClick={prevPage}><i className="fa fa-arrow-left"></i> Previous</button>
			</div>
			) : null}
			{!isLastPage ? (
				<div>
					<button className="btn btn-light m-3 load-button" onClick={nextPage}>Next <i className="fa fa-arrow-right"></i></button>
				</div>
			) : null}
		</div>
	)
}

const root = ReactDOM.createRoot(document.querySelector("#root"));

root.render (
	<React.StrictMode>
		<App />
	</React.StrictMode>
)
