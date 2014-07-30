<?php
/**
 * Metabox "Behavior"
 *
 * Used in class-popup-admin.php
 * Available variables: $popup
 */

?>
<div class="wpmui-grid-12">
	<div class="col-12">
		<strong><?php _e( 'When to show the Pop Up:', PO_LANG ); ?></strong>
	</div>
</div>
<div class="wpmui-grid-12">
	<div class="col-12 inp-row">
		<label>
			<input type="radio"
				name="po_display"
				id="po-display-delay"
				value="delay"
				data-toggle=".opt-display-delay"
				<?php checked( $popup->display, 'delay' ); ?> />
			<?php _e( 'Appear after', PO_LANG ); ?>
		</label>
		<span class="opt-display-delay">
			<input type="number"
				min="0"
				max="999"
				maxlength="3"
				name="po_delay"
				class="inp-small"
				value="<?php echo esc_attr( $popup->delay ); ?>"
				placeholder="10" />
			<select name="po_delay_type">
				<option value="s" <?php selected( $popup->delay_type, 's' ); ?>>
					<?php _e( 'Seconds', PO_LANG ); ?>
				</option>
				<option value="m" <?php selected( $popup->delay_type, 'm' ); ?>>
					<?php _e( 'Minutes', PO_LANG ); ?>
				</option>
			</select>
		</span>
	</div>
	<div class="col-12 inp-row">
		<label>
			<input type="radio"
				name="po_display"
				id="po-display-scroll"
				value="scroll"
				data-toggle=".opt-display-scroll"
				<?php checked( $popup->display, 'scroll' ); ?> />
			<?php _e( 'Appear after', PO_LANG ); ?>
		</label>
		<span class="opt-display-scroll">
			<input type="number"
				min="0"
				max="100"
				maxlength="3"
				name="po_scroll"
				class="inp-small"
				value="<?php echo esc_attr( $popup->scroll ); ?>"
				placeholder="25" />
		</span>
		<?php _e( '% of the page has been scrolled.', PO_LANG ); ?>
	</div>
	<div class="col-12 inp-row">
		<label>
			<input type="radio"
				name="po_display"
				id="po-display-anchor"
				value="anchor"
				data-toggle=".opt-display-anchor"
				<?php checked( $popup->display, 'anchor' ); ?> />
			<?php _e( 'Appear after user scrolled past a CSS selector', PO_LANG ); ?>
		</label>
		<span class="opt-display-anchor">
			<input type="text"
				maxlength="50"
				name="po_anchor"
				value="<?php echo esc_attr( $popup->anchor ); ?>"
				placeholder="<?php _e( '.class or #id', PO_LANG ); ?>" />
		</span>
	</div>
</div>

<hr />

<div class="wpmui-grid-12">
	<div class="col-12">
		<strong><?php _e( '"Never see this message again" settings:', PO_LANG ); ?></strong>
	</div>
</div>
<div class="wpmui-grid-12">
	<div class="col-12 inp-row">
		<label>
			<input type="checkbox"
				name="po_can_hide"
				id="po-can-hide"
				data-toggle=".chk-can-hide"
				data-or="#po-can-hide,#po-close-hides"
				<?php checked( $popup->can_hide ); ?>/>
			<?php _e( 'Add "Never see this message again" link', PO_LANG ); ?>
		</label>
	</div>
	<div class="col-12 inp-row">
		<label>
			<input type="checkbox"
				name="po_close_hides"
				id="po-close-hides"
				data-toggle=".chk-can-hide"
				data-or="#po-can-hide,#po-close-hides"
				<?php checked( $popup->close_hides ); ?>/>
			<?php _e( 'Close button acts as "Never see this message again" link', PO_LANG ); ?>
		</label>
	</div>
	<div class="col-12 inp-row chk-can-hide">
		<label for="po-hide-expire">
			<?php _e( 'Expiry time', PO_LANG ); ?>
			<input type="number"
				name="po_hide_expire"
				id="po-hide-expire"
				class="inp-small"
				value="<?php echo esc_attr( $popup->hide_expire ); ?>"
				placeholder="365" />
			<?php _e( 'days', PO_LANG ); ?>
			<?php _e( '(upon expiry, user will see this Pop Up again)', PO_LANG ); ?>
		</label>
	</div>
</div>

<hr />

<div class="wpmui-grid-12">
	<div class="col-12">
		<strong><?php _e( 'Closing Pop-up conditions', PO_LANG ); ?></strong>
	</div>
</div>
<div class="wpmui-grid-12">
	<div class="col-12 inp-row">
		<label>
			<input type="checkbox"
				name="po_overlay_close"
				<?php checked( ! $popup->overlay_close ); ?>
				/>
			<?php _e( 'Click on the background does not close Pop Up.', PO_LANG ); ?>
		</label>
	</div>

</div>