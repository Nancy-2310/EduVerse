import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { BsPersonCircle } from 'react-icons/bs';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

import { isEmail, isValidPassword } from '../Helpers/regexMatcher';
import HomeLayout from '../Layouts/HomeLayout';
import { createAccount } from '../Redux/Slices/AuthSlice';

function Signup() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    // Get loading state from Redux
    const { loading } = useSelector((state) => state.auth);
    
    const [previewImage, setPreviewImage] = useState("");
    const [signupData, setSignupData] = useState({
        fullName: "",
        email: "",
        password: "",
        avatar: null // Changed to null instead of empty string
    });

    function handleUserInput(e) {
        const {name, value} = e.target;
        setSignupData({
            ...signupData,
            [name]: value
        });
    }

    function getImage(event) {
        event.preventDefault();
        const uploadedImage = event.target.files[0];

        if(uploadedImage) {
            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml'];
            if (!allowedTypes.includes(uploadedImage.type)) {
                toast.error("Please select a valid image file (jpg, jpeg, png, svg)");
                return;
            }

            // Validate file size (5MB limit)
            const maxSize = 5 * 1024 * 1024;
            if (uploadedImage.size > maxSize) {
                toast.error("File size should be less than 5MB");
                return;
            }

            setSignupData({
                ...signupData,
                avatar: uploadedImage
            });
            
            const fileReader = new FileReader();
            fileReader.readAsDataURL(uploadedImage);
            fileReader.addEventListener("load", function () {
                setPreviewImage(this.result);
            });
        }
    }

    // Add this test function to your Signup component
async function testDirectRegistration(formData) {
  try {
    console.log('=== TESTING DIRECT FETCH ===');
    
    const response = await fetch('http://localhost:5000/api/v1/user/register', {
      method: 'POST',
      body: formData,
      credentials: 'include',
      // Don't set Content-Type for FormData, let browser set it
    });

    console.log('Direct fetch response status:', response.status);
    console.log('Direct fetch response ok:', response.ok);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response text:', errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('Direct fetch success data:', data);
    
    if (data.success) {
      toast.success('Registration successful!');
      navigate('/');
      return data;
    } else {
      throw new Error(data.message || 'Registration failed');
    }

  } catch (error) {
    console.error('Direct fetch error:', error);
    
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      toast.error('Connection failed. Please check if the server is running.');
    } else {
      toast.error(error.message || 'Registration failed');
    }
    
    throw error;
  }
}

// Modified createNewAccount function
async function createNewAccount(event) {
  event.preventDefault();
  
  console.log('Form submitted with data:', signupData);
  
  // Validation (your existing validation code)
  if(!signupData.email || !signupData.password || !signupData.fullName) {
    toast.error("Please fill all the required details");
    return;
  }

  if(!signupData.avatar) {
    toast.error("Please select a profile picture");
    return;
  }

  if(signupData.fullName.length < 5) {
    toast.error("Name should be atleast of 5 characters");
    return;
  }

  if(!isEmail(signupData.email)) {
    toast.error("Invalid email id");
    return;
  }

  if(!isValidPassword(signupData.password)) {
    toast.error("Password should be 6 - 16 character long with atleast a number and special character");
    return;
  }

  // Create FormData
  const formData = new FormData();
  formData.append("fullName", signupData.fullName.trim());
  formData.append("email", signupData.email.trim());
  formData.append("password", signupData.password);
  
  if (signupData.avatar) {
    formData.append("avatar", signupData.avatar);
  }

  // Debug FormData
  console.log('FormData contents:');
  for (let [key, value] of formData.entries()) {
    console.log(key, value);
  }

  try {
    // TEST 1: Try direct fetch first
    console.log('=== ATTEMPTING DIRECT FETCH ===');
    await testDirectRegistration(formData);
    
    // If direct fetch works, the issue is with Redux/axios
    console.log('Direct fetch worked! Issue is with Redux/axios setup');
    
  } catch (directFetchError) {
    console.error('Direct fetch failed:', directFetchError);
    
    try {
      // TEST 2: Try Redux approach
      console.log('=== ATTEMPTING REDUX APPROACH ===');
      const response = await dispatch(createAccount(formData));
      console.log('Redux response:', response);
      
      if(response?.payload?.success) {
        setSignupData({
          fullName: "",
          email: "",
          password: "",
          avatar: null
        });
        setPreviewImage("");
        navigate("/");
      }
    } catch (reduxError) {
      console.error('Redux approach also failed:', reduxError);
    }
  }
}

    return (
        <HomeLayout>
            <div className='flex overflow-x-auto items-center justify-center h-[100vh]'>
                <form noValidate onSubmit={createNewAccount} className='flex flex-col justify-center gap-3 rounded-lg p-4 text-white w-96 shadow-[0_0_10px_black]'>
                    <h1 className="text-center text-2xl font-bold">Registration Page</h1>

                    {/* Avatar Upload */}
                    <label htmlFor="image_uploads" className="cursor-pointer">
                        {previewImage ? (
                            <img 
                                className="w-24 h-24 rounded-full m-auto object-cover border-2 border-gray-300" 
                                src={previewImage} 
                                alt="Avatar preview"
                            />
                        ) : (
                            <BsPersonCircle className='w-24 h-24 rounded-full m-auto text-gray-400 hover:text-white transition-colors' />
                        )}
                    </label>
                    <input 
                        onChange={getImage}
                        className="hidden"
                        type="file"
                        name="image_uploads"
                        id="image_uploads"
                        accept=".jpg,.jpeg,.png,.svg"
                        disabled={loading}
                    />

                    {/* Full Name */}
                    <div className='flex flex-col gap-1'>
                        <label htmlFor="fullName" className='font-semibold'> Name </label>
                        <input 
                            type="text" 
                            required
                            name="fullName"
                            id="fullName"
                            placeholder="Enter your name.."
                            className="bg-transparent px-2 py-1 border rounded focus:outline-none focus:border-yellow-500 disabled:opacity-50"
                            onChange={handleUserInput}
                            value={signupData.fullName}
                            disabled={loading}
                        />
                    </div>

                    {/* Email */}
                    <div className='flex flex-col gap-1'>
                        <label htmlFor="email" className='font-semibold'> Email </label>
                        <input 
                            type="email" 
                            required
                            name="email"
                            id="email"
                            placeholder="Enter your email.."
                            className="bg-transparent px-2 py-1 border rounded focus:outline-none focus:border-yellow-500 disabled:opacity-50"
                            onChange={handleUserInput}
                            value={signupData.email}
                            disabled={loading}
                        />
                    </div>

                    {/* Password */}
                    <div className='flex flex-col gap-1'>
                        <label htmlFor="password" className='font-semibold'> Password </label>
                        <input 
                            type="password" 
                            required
                            name="password"
                            id="password"
                            placeholder="Enter your password.."
                            className="bg-transparent px-2 py-1 border rounded focus:outline-none focus:border-yellow-500 disabled:opacity-50"
                            onChange={handleUserInput}
                            value={signupData.password}
                            disabled={loading}
                        />
                    </div>

                    {/* Submit Button */}
                    <button 
                        type="submit" 
                        className='mt-2 bg-yellow-600 hover:bg-yellow-500 transition-all ease-in-out duration-300 rounded-sm py-2 font-semibold text-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                        disabled={loading}
                    >
                        {loading && <AiOutlineLoading3Quarters className="animate-spin" />}
                        {loading ? 'Creating Account...' : 'Create account'}
                    </button>

                    <p className="text-center">
                        Already have an account ? <Link to="/login" className='link text-accent cursor-pointer hover:underline'> Login</Link>
                    </p>
                </form>
            </div>
        </HomeLayout>
    );
}

export default Signup;