-- Create reviews table for vehicle review system
-- Drop table if exists (for development/testing)
DROP TABLE IF EXISTS public.reviews CASCADE;

-- Create reviews table
CREATE TABLE public.reviews (
    review_id SERIAL PRIMARY KEY,
    inv_id INT NOT NULL,
    account_id INT NOT NULL,
    review_text TEXT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (inv_id) REFERENCES public.inventory(inv_id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES public.account(account_id) ON DELETE CASCADE,
    -- Prevent duplicate reviews from same user for same vehicle
    UNIQUE(inv_id, account_id)
);

-- Create index for faster queries
CREATE INDEX idx_reviews_inv_id ON public.reviews(inv_id);
CREATE INDEX idx_reviews_account_id ON public.reviews(account_id);

-- Sample data for testing (optional)
-- INSERT INTO public.reviews (inv_id, account_id, review_text, rating) 
-- VALUES (1, 1, 'Great car! Very comfortable and reliable. Would highly recommend to anyone looking for a quality vehicle.', 5);
