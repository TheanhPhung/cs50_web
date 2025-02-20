function App() {
	const [pageNumber, setPageNumber] = React.useState(1);
	const [posts, setPosts] = React.useState([]);
	const [isLastPage, setIsLastPage] = React.useState(false);
	const [latestPost, setLatestPost] = React.useState(null);
	const [notifications, setNotifications] = React.useState(1);

	React.useEffect(() => {
		async function update() {
			const data_all = await getPosts(pageNumber);
			setPosts(data_all.results);

			const data_latest = await getLatestPost();
			setLatestPost(data_latest.results[0]);
			
			if (latestPost) {
				setIsLastPage(data_all.results.some(post => post.id === data_latest.results[0].id));
			}
		}
		update();
	}, [pageNumber]);

	return (
		<div className="container">
			<TitleBar notifications={notifications}/>
			<NewPost />
			<ViewPosts posts={posts} />
			<LoadPageButton 
				pageNumber={pageNumber} 
				setPageNumber={setPageNumber} 
				posts={posts}
				isLastPage={isLastPage}
			/>
		</div>
	)
}

async function getLatestPost() {
	const response = await fetch("/posts/filter=last/");
	const data = await response.json();
	return data;
}

async function getPosts(pageNumber) {
	const response = await fetch(`/posts/?p=${pageNumber}`);
	const data = await response.json();
	return data;
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

function NewPost() {
	function handleFormSubmit(event) {
		event.preventDefault();
		console.log("Form is submited!");
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

function ViewPost({ post }) {
	const [likeButtonClassName, setLikeButtonClassName] = React.useState("btn btn-secondary me-3 ms-3");
	function handleLikeClick() {
		console.log("Click on like button for post: ", post.id);
	}

	function handleCommentClick() {
		console.log("Click on comment button for post: ", post.id);
	}

	const d = new Date(post.created_at);
	const formatedDateTime = d.toLocaleString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	});


	return (
		<div className="container-fluid card p-3 m-3" id={post.id}>
			<div className="card-header">
				<div className="d-flex flex-row justify-content-between">
					<div className="flex-item">
						<h6 className="mt-2"><strong><span className="text-secondary owner-post">{post.owner_name}</span></strong></h6>
					</div>
					<div className="flex-item">
						<button className="btn btn-primary"><i className="fa fa-edit"></i> Edit</button>
					</div>
				</div>
			</div>
			<div className="card-body container p-3">
				Post {post.id}: {post.content}
			</div>
			<div className="d-flex flex-row justify-content-between">
				<div className="flex-item">
					<button className={likeButtonClassName} onClick={handleLikeClick}><i className="fa fa-thumbs-up"></i> {post.like_count} Like{post.like_count > 1 ? "s": ""}</button>
					<button className="btn btn-secondary" onClick={handleCommentClick}><i className="fa fa-comment"></i> {post.comment_count} Comment{post.comment_count > 1 ? "s": ""}</button>
				</div>
				<div className="flex-item me-3 text-secondary">{formatedDateTime}</div>
			</div>
		</div>
	)
}

function ViewPosts({ posts }) {
		
	return posts.map(post => 
		<ViewPost post={post} key={post.id} />
	);
}

const root = ReactDOM.createRoot(document.querySelector("#root"));

root.render (
	<React.StrictMode>
		<App />
	</React.StrictMode>
)

function LoadPageButton({ pageNumber, setPageNumber, posts, isLastPage }) {
	function pageDown() {
		setPageNumber(pageNumber - 1);
	}

	function pageUp() {
		setPageNumber(pageNumber + 1);
	}

	return (
		<div className="d-flex flex-row justify-content-center mt-3">
			{pageNumber > 1 ? (
			<div>
				<button className="btn btn-light m-3 load-button" onClick={pageDown}><i className="fa fa-arrow-left"></i> Previous</button>
			</div>
			) : null}
			{!isLastPage ? (
				<div>
					<button className="btn btn-light m-3 load-button" onClick={pageUp}>Next <i className="fa fa-arrow-right"></i></button>
				</div>
			) : null}
		</div>
	)
}
