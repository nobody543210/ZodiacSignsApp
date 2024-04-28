
import { useState, useEffect } from 'react';
import { calculateZodiacSign } from './utils/zodiacUtils';

const App = () => {
  const [readings, setReadings] = useState([]);
  const [dob, setDob] = useState('');
  const [isSubscribeButtonEnabled, setSubscribeButtonEnabled] = useState(false);
  const [showSubscribeForm, setShowSubscribeForm] = useState(false);
  const [calculatedZodiacSign, setCalculatedZodiacSign] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [existingUser, setExistingUser] = useState(false);
  const [subscriptionSuccess, setSubscriptionSuccess] = useState(false);

  const handleEmailChange = () => {
    if (existingUser) {
      setExistingUser(false);
      setSubscriptionSuccess(false);
    }
  };

  useEffect(() => {
    fetch('https://zodiacsignsapp-api.onrender.com/readings')
      .then(response => response.json())
      .then(data => {
        setReadings(data);
        setLoading(false);
      })
      .catch(error => console.error('Error fetching readings:', error));
  }, []);

  const validateDob = (dob) => {
    return dob !== '';
  };

  const handleSubscribeClick = async () => {
    if (!validateDob(dob)) {
      alert('Please enter a valid date of birth.');
      return;
    }
  
    const zodiacSign = calculateZodiacSign(dob);
    setCalculatedZodiacSign(zodiacSign);
  
    try {
      const response = await fetch(`https://zodiacsignsapp-api.onrender.com/readings`);
      const data = await response.json();
  

        setReadings([data]);
    } catch (error) {
      console.error('Error fetching readings:', error);
    }
    setShowSubscribeForm(true);
  };

  const handleSubscribeFormSubmit = async (e) => {
    e.preventDefault();
    if (name.trim() === '') {
      alert('Please enter your name.');
      return;
    }
    if (!validateEmail(email)) {
      alert('Please enter a valid email address.');
      return;
    }
    try {
      const response = await fetch(`https://zodiacsignsapp-api.onrender.com/checkUser?email=${email}`);
      const data = await response.json();
      if (data.exists) {
        setExistingUser(true);
        setSubscriptionSuccess(false);
        return;
      }
      setExistingUser(false);
      await handleSubscribe();
      setSubscriptionSuccess(true);
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
    }
  };
  
  const handleSubscribe = async () => {
    const response = await fetch('https://zodiacsignsapp-api.onrender.com/subscribeNewsletter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: capitalize(name),
        email,
        zodiacSign: calculatedZodiacSign,
      }),
    });

    if (!response.ok) {
      console.error('Error subscribing to newsletter:', response.statusText);
      throw new Error('Failed to subscribe to newsletter');
    }

    const data = await response.json();
    console.log('Subscription successful:', data);
  };

  const capitalize = (str) => {
    return str.toLowerCase().replace(/(?:^|\s)\S/g, function(firstLetter) {
      return firstLetter.toUpperCase();
    });
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return (
    <div className='App'>
      <form>
        <input
          id='dob'
          type="date"
          value={dob}
          onChange={(e) => {
            setDob(e.target.value);
            setSubscribeButtonEnabled(validateDob(e.target.value));
          }}
        />
        <br />
        <button
          onClick={(e) => {
            if (isSubscribeButtonEnabled && !loading) {
              e.preventDefault();
              handleSubscribeClick();
            }
          }}
          disabled={!isSubscribeButtonEnabled || loading}
        >
          Check
        </button> 
        <br />
        {calculatedZodiacSign && readings.length > 0 && readings[0][calculatedZodiacSign] && (
          <div>
            <p className='readingText'>{readings[0][calculatedZodiacSign]}</p>
          </div>
        )}
        <br />
        {showSubscribeForm && (
          <>
            {existingUser && <p style={{ color: 'red' }}>User with this email already exists.</p>}
            {subscriptionSuccess && <p style={{ color: 'green' }}>Subscription successful! Check your email for more info.</p>}
            <h1 style={{ color: 'white' }}>Subscribe to the newsletter for free to receive your monthly astrological reading:</h1>
            <label>Zodiac Sign</label>
            <br />
            <input type="text" value={calculatedZodiacSign} disabled />
            <br />
            <label>Name</label>
            <br />
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} autoComplete='on' />
            <br />
            <label>Email</label>
            <br />
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                handleEmailChange();
              }}
              autoComplete='on'
            />
            <br />
            <button type="submit" onClick={handleSubscribeFormSubmit}>
              Sign up
            </button>
          </>
        )}
      </form>
    </div>
  );
};

export default App;
