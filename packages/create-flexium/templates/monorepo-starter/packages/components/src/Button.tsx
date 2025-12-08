interface ButtonProps {
  children: any
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'small' | 'medium' | 'large'
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
}: ButtonProps) {
  const classes = `btn btn-${variant} btn-${size}`

  return (
    <button class={classes} onclick={onClick}>
      {children}
    </button>
  )
}
