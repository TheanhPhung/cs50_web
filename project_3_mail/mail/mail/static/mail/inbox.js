document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  

  // By default, load the inbox
  load_mailbox('inbox');
});

// Create alert when send email successfully or error
function alert(className, message) {
  document.querySelectorAll('#message').forEach(div => {
    div.remove();
  });

  const parent_div = document.querySelector('#messages');
  const div = document.createElement('div');
  div.id = 'message';
  div.className = className;
  div.innerHTML = message;
  div.style.animationPlayState = 'running';
  parent_div.append(div);
}

// Send email
function send_email() {
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  // Fetch API for sending email
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
    })
  })
  .then(response => response.json())
  .then(result => {
    console.log(result);

    // Alert
    if (result.message) {
      alert("alert alert-success", result.message);
    } else {
      alert("alert alert-warning", result.error);
    } 
  }).catch(error => {
    console.log("Error: ", error);
  });

  setTimeout(() => {
    load_mailbox("sent");
  }, 1000);
}


function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  // If submit compose form, send email
  document.querySelector('#compose-form').onsubmit = function(event) {
    event.preventDefault();
    send_email();
  } 
}

function load_mailbox(mailbox) {

  // Define action mark the email as read
  function mark_as_read(email) {
    fetch(`/emails/${email.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        read: true
      })
    })
  }

  // WHen click on each email card, show the mail detail contents
  function read_email() {
    document.querySelectorAll('.mail-detail').forEach(div => {
      div.addEventListener('click', () => {
        fetch(`/emails/${div.id}`)
        .then(response => response.json())
        .then(email => {
          console.log(email);
          // Delete all child elements of #emails-view
          const emails_view = document.querySelector('#emails-view');

          while (emails_view.firstChild) {
            emails_view.removeChild(emails_view.firstChild);
          }

          // Create detail email view
          const div = document.createElement('div');
          const div_sender = document.createElement('div');
          const div_recipients = document.createElement('div');
          const div_subject = document.createElement('div');
          const div_timestamp = document.createElement('div');
          const hr = document.createElement('hr');
          const div_body = document.createElement('div');

          div_sender.innerHTML = `<strong>From:</strong> ${email.sender}`;
          div_recipients.innerHTML = `<strong>Recipients:</strong> ${email.recipients.join(", ")}`;
          div_subject.innerHTML = `<strong>Subject:</strong> ${email.subject}`;
          div_timestamp.innerHTML = `<strong>Timestamp:</strong> ${email.timestamp}`;
          div_body.innerHTML = email.body;

          div.append(div_sender);
          div.append(div_recipients);
          div.append(div_subject);
          div.append(div_timestamp);

          const user_email = document.querySelector('#user_email').value;
          if (email.sender !== user_email) {
            const button_reply = document.createElement('button');
            button_reply.className = 'btn btn-sm btn-outline-primary';
            button_reply.id = 'reply';
            button_reply.innerHTML = 'Reply';
            div.append(button_reply);

            button_reply.addEventListener('click', () => {
              console.log("reply button is clicked!");

              // Reply email
              document.querySelector('#compose-recipients').value = email.sender;
              document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
              document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: "${email.body}"`;
              
              document.querySelector('#emails-view').style.display = 'none';
              document.querySelector('#compose-view').style.display = 'block';

              //compose_email();

            })
          }

          div.append(hr);
          div.append(div_body);

          emails_view.append(div);

          // Mark the email as read when click on the email card
          mark_as_read(email);
        })
      })
    })
  }

  function view_email(email) {
    // Get user's email
    const user_email = document.querySelector('#user_email').value;

    const div = document.createElement('div');
    const subdiv = document.createElement('div');
    const div_mail = document.createElement('div');
    const div_subject = document.createElement('div');
    const div_timestamp = document.createElement('div');
    const archive_button = document.createElement('button');

    div.className = "container-fluid card mt-2 mail-detail";
    div.id = email.id;

    subdiv.className = "row";
    div_mail.className = "col-sm-3 mt-2 mb-2";
    div_subject.className = "col-sm-5 mt-2 mb-2";
    div_timestamp.className = "col-sm-3 mt-2 mb-2 timestamp";

    if (user_email === email.sender) {
      div_mail.innerHTML = email.recipients.join(", ");
    } else {
      div_mail.innerHTML = email.sender;
    }
    div_subject.innerHTML = email.subject;
    div_timestamp.innerHTML = email.timestamp;

    // Set background for each email based on what if email is read or not
    if (email.read) {
      div.style.background = 'lightgrey';
    } else {
      div.style.background = 'white';
    }

    // Append div tags into the view
    document.querySelector('#emails-view').append(div);
    div.append(subdiv);
    subdiv.append(div_mail);
    subdiv.append(div_subject);
    subdiv.append(div_timestamp);


    // Add Archive/Unarchive button
    if (mailbox !== "sent") {
      archive_button.className = "col-sm-1 btn btn-sm btn-outline-secondary";
      archive_button.innerHTML = 'Archive';
      if (mailbox === "archive") {
        archive_button.innerHTML = 'Unarchive';
      }
      subdiv.append(archive_button);
    }

    // Archive the email
    archive_button.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      console.log(`Archive button for email ${email.id} is clicked!`);

      if (mailbox === 'inbox') {
        fetch(`/emails/${email.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            archived: true
          })
        });

        alert("alert alert-info", `Email "${email.subject}" is archived!`);

      } else {
        fetch(`/emails/${email.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            archived: false 
          })
        });
        setTimeout(() => {
          load_mailbox('inbox');
        }, 1000)

        alert("alert alert-secondary", `Email "${email.subject}" is unarchined!`);
      }

      // Hide archived email from the box
      const element = archive_button.closest('.mail-detail');
      element.style.animationPlayState = 'running';
      setTimeout(() => {
        element.remove();
      }, 2000);
    })
    

  }

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    console.log(emails);
    for (email of emails) {
      view_email(email);
    }
    read_email();
  });
}
