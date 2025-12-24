-- ============================================
-- Migration 010: RLS Policies Part 2
-- Shopping, wallet, support, and audit policies
-- ============================================

-- ============================================
-- CARTS POLICIES
-- ============================================

-- Buyers can read their own cart
CREATE POLICY carts_select_own ON carts
  FOR SELECT USING (auth.uid() = buyer_id);

-- Buyers can create their own cart
CREATE POLICY carts_insert_own ON carts
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Buyers can update their own cart
CREATE POLICY carts_update_own ON carts
  FOR UPDATE USING (auth.uid() = buyer_id);

-- Admins can view all carts
CREATE POLICY carts_admin_select ON carts
  FOR SELECT USING (is_admin());

-- ============================================
-- CART ITEMS POLICIES
-- ============================================

-- Buyers can read their own cart items
CREATE POLICY cart_items_select_own ON cart_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM carts WHERE carts.id = cart_items.cart_id AND carts.buyer_id = auth.uid())
  );

-- Buyers can manage their own cart items
CREATE POLICY cart_items_insert_own ON cart_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM carts WHERE carts.id = cart_items.cart_id AND carts.buyer_id = auth.uid())
  );

CREATE POLICY cart_items_update_own ON cart_items
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM carts WHERE carts.id = cart_items.cart_id AND carts.buyer_id = auth.uid())
  );

CREATE POLICY cart_items_delete_own ON cart_items
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM carts WHERE carts.id = cart_items.cart_id AND carts.buyer_id = auth.uid())
  );

-- ============================================
-- ORDERS POLICIES
-- ============================================

-- Buyers can read their own orders
CREATE POLICY orders_select_buyer ON orders
  FOR SELECT USING (auth.uid() = buyer_id);

-- Buyers can create orders
CREATE POLICY orders_insert_buyer ON orders
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Sellers can see orders containing their products
CREATE POLICY orders_select_seller ON orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM order_items oi
      JOIN sellers s ON oi.seller_id = s.id
      WHERE oi.order_id = orders.id AND s.user_id = auth.uid()
    )
  );

-- Sellers can update order status (for their items)
CREATE POLICY orders_update_seller ON orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM order_items oi
      JOIN sellers s ON oi.seller_id = s.id
      WHERE oi.order_id = orders.id AND s.user_id = auth.uid()
    )
  );

-- Drivers can see orders they're delivering
CREATE POLICY orders_select_driver ON orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM deliveries d
      JOIN drivers dr ON d.driver_id = dr.id
      WHERE d.order_id = orders.id AND dr.user_id = auth.uid()
    )
  );

-- Admins can manage all orders
CREATE POLICY orders_admin_all ON orders
  FOR ALL USING (is_admin());

-- ============================================
-- ORDER ITEMS POLICIES
-- ============================================

-- Buyers can read their own order items
CREATE POLICY order_items_select_buyer ON order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.buyer_id = auth.uid())
  );

-- Buyers can create order items
CREATE POLICY order_items_insert_buyer ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.buyer_id = auth.uid())
  );

-- Sellers can see order items for their products
CREATE POLICY order_items_select_seller ON order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM sellers WHERE sellers.id = order_items.seller_id AND sellers.user_id = auth.uid())
  );

-- Drivers can see order items for their deliveries
CREATE POLICY order_items_select_driver ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM deliveries d
      JOIN drivers dr ON d.driver_id = dr.id
      WHERE d.order_id = order_items.order_id AND dr.user_id = auth.uid()
    )
  );

-- Admins can manage all order items
CREATE POLICY order_items_admin_all ON order_items
  FOR ALL USING (is_admin());

-- ============================================
-- DELIVERIES POLICIES
-- ============================================

-- Available deliveries visible to approved drivers
CREATE POLICY deliveries_select_available ON deliveries
  FOR SELECT USING (
    status = 'available' AND
    EXISTS (SELECT 1 FROM drivers WHERE drivers.user_id = auth.uid() AND drivers.status = 'approved')
  );

-- Drivers can see their assigned deliveries
CREATE POLICY deliveries_select_assigned ON deliveries
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM drivers WHERE drivers.id = deliveries.driver_id AND drivers.user_id = auth.uid())
  );

-- Approved drivers can accept available deliveries
CREATE POLICY deliveries_update_accept ON deliveries
  FOR UPDATE USING (
    status = 'available' AND
    EXISTS (SELECT 1 FROM drivers WHERE drivers.user_id = auth.uid() AND drivers.status = 'approved')
  );

-- Drivers can update their assigned deliveries
CREATE POLICY deliveries_update_own ON deliveries
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM drivers WHERE drivers.id = deliveries.driver_id AND drivers.user_id = auth.uid())
  );

-- Buyers can see their order's delivery
CREATE POLICY deliveries_select_buyer ON deliveries
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = deliveries.order_id AND orders.buyer_id = auth.uid())
  );

-- Sellers can see deliveries for their orders
CREATE POLICY deliveries_select_seller ON deliveries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM order_items oi
      JOIN sellers s ON oi.seller_id = s.id
      WHERE oi.order_id = deliveries.order_id AND s.user_id = auth.uid()
    )
  );

-- Admins can manage all deliveries
CREATE POLICY deliveries_admin_all ON deliveries
  FOR ALL USING (is_admin());

-- ============================================
-- RATINGS POLICIES
-- ============================================

-- Everyone can read ratings
CREATE POLICY ratings_select_all ON ratings
  FOR SELECT USING (true);

-- Buyers can create ratings for their orders
CREATE POLICY ratings_insert_buyer ON ratings
  FOR INSERT WITH CHECK (
    auth.uid() = buyer_id AND
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_id AND orders.buyer_id = auth.uid() AND orders.status = 'completed')
  );

-- Admins can manage all ratings
CREATE POLICY ratings_admin_all ON ratings
  FOR ALL USING (is_admin());

-- ============================================
-- WALLET ACCOUNTS POLICIES
-- ============================================

-- Users can read their own wallet
CREATE POLICY wallet_accounts_select_own ON wallet_accounts
  FOR SELECT USING (auth.uid() = owner_id);

-- Admins can read all wallets
CREATE POLICY wallet_accounts_admin_select ON wallet_accounts
  FOR SELECT USING (is_admin());

-- ============================================
-- WALLET TRANSACTIONS POLICIES
-- ============================================

-- Users can read their own transactions
CREATE POLICY wallet_transactions_select_own ON wallet_transactions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM wallet_accounts WHERE wallet_accounts.id = wallet_transactions.account_id AND wallet_accounts.owner_id = auth.uid())
  );

-- Admins can read all transactions
CREATE POLICY wallet_transactions_admin_select ON wallet_transactions
  FOR SELECT USING (is_admin());

-- ============================================
-- TOPUP CODES POLICIES
-- ============================================

-- Users can check if a code is active (limited info)
CREATE POLICY topup_codes_select_active ON topup_codes
  FOR SELECT USING (status = 'active');

-- Admins can manage all codes
CREATE POLICY topup_codes_admin_all ON topup_codes
  FOR ALL USING (is_admin());

-- ============================================
-- NOTIFICATIONS POLICIES
-- ============================================

-- Users can read their own notifications
CREATE POLICY notifications_select_own ON notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update (mark as read) their own notifications
CREATE POLICY notifications_update_own ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- System can insert notifications (via service role)
-- Note: Application should use service role for creating notifications

-- Admins can manage all notifications
CREATE POLICY notifications_admin_all ON notifications
  FOR ALL USING (is_admin());

-- ============================================
-- SUPPORT TICKETS POLICIES
-- ============================================

-- Users can read their own tickets
CREATE POLICY support_tickets_select_own ON support_tickets
  FOR SELECT USING (auth.uid() = created_by);

-- Users can create tickets
CREATE POLICY support_tickets_insert_own ON support_tickets
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Users can update their open tickets
CREATE POLICY support_tickets_update_own ON support_tickets
  FOR UPDATE USING (auth.uid() = created_by AND status IN ('open', 'in_progress'));

-- Admins can manage all tickets
CREATE POLICY support_tickets_admin_all ON support_tickets
  FOR ALL USING (is_admin());

-- ============================================
-- TICKET MESSAGES POLICIES
-- ============================================

-- Users can read messages on their tickets
CREATE POLICY ticket_messages_select_own ON ticket_messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM support_tickets WHERE support_tickets.id = ticket_messages.ticket_id AND support_tickets.created_by = auth.uid())
  );

-- Users can add messages to their open tickets
CREATE POLICY ticket_messages_insert_own ON ticket_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (SELECT 1 FROM support_tickets WHERE support_tickets.id = ticket_messages.ticket_id AND support_tickets.created_by = auth.uid() AND support_tickets.status IN ('open', 'in_progress'))
  );

-- Admins can manage all messages
CREATE POLICY ticket_messages_admin_all ON ticket_messages
  FOR ALL USING (is_admin());

-- ============================================
-- AUDIT LOGS POLICIES
-- ============================================

-- Only admins can read audit logs
CREATE POLICY audit_logs_admin_select ON audit_logs
  FOR SELECT USING (is_admin());
