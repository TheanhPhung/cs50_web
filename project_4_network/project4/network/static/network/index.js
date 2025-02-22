function App() {
	const [title, setTitle] = React.useState("Network");
	const [pageNumber, setPageNumber] = React.useState(1);
	const [posts, setPosts] = React.useState([]);
	const [isLastPage, setIsLastPage] = React.useState(false);
	const [notifications, setNotifications] = React.useState(1);
	const [isEditing, setIsEditing] = React.useState(false);
	const [postId, setPostId] = React.useState(0);
	const [profileId, setProfileId] = React.useState(null);

	const [showProfile, setShowProfile] = React.useState(false);
	const [isShowFollowing, setIsShowFollowing] = React.useState(false);

	React.useEffect(() => {
		async function update() {
			const data = await getPosts(pageNumber);
			if (arePostsEqual(posts, data.results)) return;
			setPosts(data.results);
			setIsLastPage(data.count / pageNumber <= 10);
		}

		async function updateProfile() {
			const data = await getUserPosts(pageNumber, profileId);
			if (arePostsEqual(posts, data.results)) return;
			setPosts(data.results);
			setIsLastPage(data.count / pageNumber <= 10);
		}

		async function updateFollowingPosts() {
			const data = await getFollowingPosts(pageNumber);
			if (arePostsEqual(posts, data.results)) return;
			setPosts(data.results);
			setIsLastPage(data.count / pageNumber <= 10);
		}

		if (!showProfile && !isShowFollowing) {
			update();
		} else if (showProfile && !isShowFollowing) {
			updateProfile();
		} else if (!showProfile && isShowFollowing) {
			updateFollowingPosts();
		}

	}, [pageNumber, posts, profileId, showProfile, isShowFollowing]);

	return (
		<div className="container">
			<TitleBar 
				title={title} 
				setTitle={setTitle}
				notifications={notifications} 
				setShowProfile={setShowProfile}
				showProfile={showProfile}
				profileId={profileId}
				setPosts={setPosts}
				setIsShowFollowing={setIsShowFollowing}
				setPageNumber={setPageNumber}
			/>
			<NewPost 
				posts={posts} 
				setPosts={setPosts} 
				isEditing={isEditing} 
				setIsEditing={setIsEditing} 
				postId={postId}
				showProfile={showProfile}
				isShowFollowing={isShowFollowing}
			/>
			<ViewPosts 
				posts={posts} 
				setIsEditing={setIsEditing} 
				setPostId={setPostId} 
				setShowProfile={setShowProfile}
				setProfileId={setProfileId}
				setPageNumber={setPageNumber}
				setTitle={setTitle}
			/>
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

async function getUserPosts(pageNumber, profileId) {
	const response = await fetch(`/posts/profile/${profileId}/`);
	const data = await response.json();
	return data;
}

async function getFollowingPosts(pageNumber) {
	const userId = await getMe();
	const response = await fetch(`/posts/filter=following/${userId}/?p=${pageNumber}`);
	const data = await response.json();
	return data;
}

async function getMe() {
	const response = await fetch("/me/");
	const result = await response.json()
	return result.id;
}

async function getProfile(profileId) {
	const response = await fetch(`/users/${profileId}/`);
	const data = await response.json();
	return data;
}

function ShowTitle({ title, showProfile, profileId }) {
	const [followerCount, setFollowerCount] = React.useState(0);
	const [followingCount, setFollowingCount] = React.useState(0);
	const [isFollowed, setIsFollowed] = React.useState(false);
	const [buttonName, setButtonName] = React.useState("Follow");
	const [buttonClassName, setButtonClassName] = React.useState("btn btn-primary m-3")
	const [isOwnProfile, setIsOwnProfile] = React.useState(true);

	React.useEffect(() => {
		async function updateTitle() {
			if (!showProfile) return;

			const myId = await getMe();
			const user = await getProfile(myId);
			const profile = await getProfile(profileId);
			setFollowerCount(profile.follower_count);
			setFollowingCount(profile.follow.length);
	
			if (myId === profile.id) {
				setIsOwnProfile(true);
				return;
			}

			setIsOwnProfile(false);
			const checkIsFollowed = user.follow.includes(profileId);
			setIsFollowed(checkIsFollowed);
			if (checkIsFollowed) {
				setButtonName("Unfollow");
			} 
		}
		updateTitle();
		console.log(followerCount);
	}, [profileId, showProfile]);

	async function handleFollowClick() {
		const user = await getMe();
		const response = await fetch(`/users/${user}/`);
		const data = await response.json();

		let follow_list = [];
		if (!isFollowed) {
			setFollowerCount(followerCount + 1);
			setButtonName("Unfollow");
			setIsFollowed(true);
			setButtonClassName("btn btn-light m-3");

			follow_list = [...data.follow, profileId];
		} else {
			setFollowerCount(followerCount - 1);
			setButtonName("Follow");
			setIsFollowed(false);
			setButtonClassName("btn btn-primary m-3");

			follow_list = data.follow.filter(following => following !== user);
		}
		fetch(`/users/${user}/`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				"X-CSRFToken": document.cookie.split("=")[1]
			},
			body: JSON.stringify ({
				"username": data.username,
				"follow": follow_list
			})
		})
	}

	return (
		<div id="title">
			<span className="badge bg-light text-dark m-3 p-3">
				<h4 className="mt-2">{title}</h4>
				<div className="d-flex flex-row justify-content-end p-1">
					{showProfile ? (<span style={{ fontSize: "14px" }}>(Follower: {followerCount})</span>) : null}
				</div>
				<div className="d-flex flex-row justify-content-end p-1">
					{showProfile ? (<span style={{ fontSize: "14px" }}>(Following: {followingCount})</span>) : null}
				</div>
			</span>
			{showProfile && !isOwnProfile ? (
				<button className={buttonClassName} onClick={handleFollowClick}>{buttonName} <i className="fa fa-plus"></i></button>
			) : null}
		</div>
	)
}

function Following({setPosts, setIsShowFollowing, setShowProfile, setPageNumber, setTitle}) {
	React.useEffect(() => {
		async function update() {
			
		}
	}, []); 

	async function showFollowingPosts() {
		setIsShowFollowing(true);
		setShowProfile(false);
		setPageNumber(1);
		setTitle("Following Posts")
	}

	return (
		<div>
			<button className="btn btn-dark" onClick={showFollowingPosts}>Following</button>
		</div>
	)
}

function Notification({notifications}) {
	return (
		<div>
			<button className="btn btn-primary position-relative m-3">
				Notification <i className="fa fa-bell"></i>
				<span 
					className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
				>
					{notifications > 0 ? notifications : null}
				</span>
			</button>
		</div>
	)
}

function TitleBar({ title, setTitle, notifications, showProfile, setShowProfile, profileId, setPosts, setIsShowFollowing, setPageNumber }) {
	return (
		<div>
			<div className="d-flex flex-row justify-content-between">
				<div className="flex-item">
					<ShowTitle 
						title={title} 
						setTitle={setTitle}
						showProfile={showProfile} 
						profileId={profileId} 
					/>
				</div>
				<div className="flex-item">
					<div>
						<div>
							<Notification notifications={notifications} />
						</div>
						<div className="ms-3">
							<Following 
								setPosts={setPosts} 
								setIsShowFollowing={setIsShowFollowing} 
								setShowProfile={setShowProfile} 
								setPageNumber={setPageNumber}
								setTitle={setTitle}
							/>
						</div>
					</div>
				</div>
			</div>
			<hr />
		</div>
	)
}

function NewPost({posts, setPosts, isEditing, setIsEditing, postId, showProfile, isShowFollowing}) {
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

	return (!showProfile && !isShowFollowing ? (
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

	) : null)
}

function ViewPost({ post, setIsEditing, setPostId, setShowProfile, setProfileId, setPageNumber, setTitle }) {
	const [likeButtonClassName, setLikeButtonClassName] = React.useState("btn btn-secondary me-3 ms-3");
	const [likeCount, setLikeCount] = React.useState(post.like_count);
	const [commentCount, setCommentCount] = React.useState(post.comment_count);
	const [isLiked, setIsLiked] = React.useState(false);
	const [isOwnPost, setIsOwnPost] = React.useState(false);
	const [isUpdated, setIsUpdated] = React.useState(false);
	const [lastContent, setLastContent] = React.useState(post.content);
	const [lastUpdateTime, setLastUpdateTime] = React.useState(post.created_at);
	const [showComment, setShowComment] = React.useState(false);

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

	function handleShowProfile() {
		console.log("Show profile for ", post.owner_name);
		setProfileId(post.owner);
		setShowProfile(true);
		setPageNumber(1);
		setTitle(`${post.owner_name}'s Profile`);
		document.querySelector("#title").scrollIntoView();
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
						<button className="btn btn-light" onClick={handleShowProfile}>{post.owner_name}</button>
					</div>
					<div className="flex-item">
						{isOwnPost ? (
							<button className="btn btn-primary" onClick={handleEditClick}>
								<i className="fa fa-edit"></i> Edit
							</button>) : null
						}
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

function ViewPosts({ posts, setIsEditing, setPostId, setShowProfile, setProfileId, setPageNumber, setTitle }) {
	return posts.map(post => 
		<ViewPost 
			post={post} 
			setIsEditing={setIsEditing} 
			setPostId={setPostId} 
			setShowProfile={setShowProfile}
			setProfileId={setProfileId}
			setPageNumber={setPageNumber}
			setTitle={setTitle}
			key={post.id} 
		/>
	);
}

function LoadPageButton({ pageNumber, setPageNumber, posts, isLastPage }) {
	const headSection = document.querySelector("#title");

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
