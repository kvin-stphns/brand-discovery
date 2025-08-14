'use client'
import { Fragment, useEffect, useState } from 'react'
import { Menu, Transition } from '@headlessui/react'
import Link from 'next/link'
import { hrefFor } from '@/lib/nav'

interface MegaMenuProps { category: string }

const topLinks = ['Discover', 'Brands', 'Categories', 'Designers', 'Rankings', 'Explore']
const bottomLinks = ['Login', 'Liked', 'Saved', 'Submissions', 'About']
const discoverLinks = ['View All', 'Spotlight', 'Trending', 'Lookbooks', 'Location', 'Random']
const brandLinks = ['View All', 'Alphabetical', 'Newest', 'Featured', 'Popular', 'Random']
const categoryLinksBase = ['View All', 'Tops', 'Bottoms', 'Outerwear', 'Accessories', 'Footwear']
const exploreOnly = ['Home Goods', 'Furniture', 'Art', 'Lighting', 'Tech']
const giftsOnly = ['View All', 'Home Goods', 'Furniture', 'Art', 'Lighting', 'Tech']
const designerLinks = ['View All', 'Trending', 'Spotlight', 'Lookbooks', 'Locations', 'Random']
const rankingLinks = ['Leaderboard', 'Most Liked', 'Most Viewed', 'Recently Liked', 'Locations']

// Manual placement (desktop & tablet)
// Desktop looked right at 106.5px for you; tablet needed ~2px less to be flush.
const TOP_DESKTOP = 'top-[106.5px]'
const TOP_TABLET  = 'tablet:top-[104.5px]'

// Fixed desktop column width, seam at 1px
const COL_W = 'w-[400px]'
const LAYER_LEFT = 'left-[401px]' // 400 + 1px seam

const MegaMenu = ({ category }: MegaMenuProps) => {
  const [showDiscoverMenu, setShowDiscoverMenu] = useState(false)
  const [showBrandsMenu, setShowBrandsMenu] = useState(false)
  const [showCategoriesMenu, setShowCategoriesMenu] = useState(false)
  const [showDesignersMenu, setShowDesignersMenu] = useState(false)
  const [showRankingsMenu, setShowRankingsMenu] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLinkClick = (link: string) => {
    const closeAllExcept = (menuName: string) => {
      if (menuName !== 'Discover') setShowDiscoverMenu(false)
      if (menuName !== 'Brands') setShowBrandsMenu(false)
      if (menuName !== 'Categories') setShowCategoriesMenu(false)
      if (menuName !== 'Designers') setShowDesignersMenu(false)
      if (menuName !== 'Rankings') setShowRankingsMenu(false)
    }
    if (link === 'Discover')  { closeAllExcept('Discover');  setShowDiscoverMenu(v => !v) }
    if (link === 'Brands')    { closeAllExcept('Brands');    setShowBrandsMenu(v => !v) }
    if (link === 'Categories'){ closeAllExcept('Categories');setShowCategoriesMenu(v => !v) }
    if (link === 'Designers') { closeAllExcept('Designers'); setShowDesignersMenu(v => !v) }
    if (link === 'Rankings')  { closeAllExcept('Rankings');  setShowRankingsMenu(v => !v) }
  }

  const to = (section: 'discover'|'brands'|'categories'|'designers'|'rankings', link: string) =>
    hrefFor(section, category, link)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.menu-container')) {
        setShowDiscoverMenu(false)
        setShowBrandsMenu(false)
        setShowCategoriesMenu(false)
        setShowDesignersMenu(false)
        setShowRankingsMenu(false)
        setIsMenuOpen(false)
      }
    }
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowDiscoverMenu(false)
        setShowBrandsMenu(false)
        setShowCategoriesMenu(false)
        setShowDesignersMenu(false)
        setShowRankingsMenu(false)
        setIsMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEsc)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEsc)
    }
  }, [])

  useEffect(() => {
    if (!isMenuOpen) {
      setShowDiscoverMenu(false)
      setShowBrandsMenu(false)
      setShowCategoriesMenu(false)
      setShowDesignersMenu(false)
      setShowRankingsMenu(false)
    }
  }, [isMenuOpen])

  return (
    <Menu as="div" className="relative">
      {({ open }) => {
        if (open !== isMenuOpen) setIsMenuOpen(open)
        return (
          <>
            <Menu.Button
              aria-haspopup="true"
              aria-expanded={isMenuOpen}
              aria-label={`${category} menu`}
              className="text-sm tracking-[0.25em] hover:text-gray-500 transition-colors"
            >
              {category}
            </Menu.Button>

            <div className="menu-container" role="presentation">
              {/* PRIMARY COLUMN — 2D (no shadow), no top border; owns the single center seam */}
              <Transition
                show={isMenuOpen}
                as={Fragment}
                enter="transition duration-100 ease-out"
                enterFrom="transform translate-x-[-100%]"
                enterTo="transform translate-x-0"
                leave="transition duration-75 ease-out"
                leaveFrom="transform translate-x-0"
                leaveTo="transform translate-x-[-100%]"
              >
                <Menu.Items
                  static
                  className={[
                    'fixed left-0 bottom-0 bg-white z-[1006] overflow-y-auto shadow-none',
                    TOP_DESKTOP, TOP_TABLET, COL_W,
                  ].join(' ')}
                >
                  {/* Center seam: authoritative 1px line ABOVE everything */}
                  <div className="absolute top-0 right-0 bottom-0 w-px bg-black z-[1010]" />

                  <div className="relative h-full">
                    <div className="min-h-full flex flex-col justify-between">
                      <div className="py-6">
                        {topLinks.map((link) => (
                          <Menu.Item key={link}>
                            {() => (
                              <a
                                href={link === 'Explore' ? '/explore' : '#'}
                                className="block px-12 py-4 text-sm tracking-[0.25em] hover:text-gray-500 transition-colors"
                                onClick={(e) => {
                                  if (link !== 'Explore') e.preventDefault()
                                  handleLinkClick(link)
                                }}
                                role="menuitem"
                                aria-haspopup="true"
                                aria-expanded={
                                  (link === 'Discover' && showDiscoverMenu) ||
                                  (link === 'Brands' && showBrandsMenu) ||
                                  (link === 'Categories' && showCategoriesMenu) ||
                                  (link === 'Designers' && showDesignersMenu) ||
                                  (link === 'Rankings' && showRankingsMenu)
                                    ? true : false
                                }
                              >
                                {link}
                              </a>
                            )}
                          </Menu.Item>
                        ))}
                      </div>

                      <div className="py-8">
                        {bottomLinks.map((link) => (
                          <Menu.Item key={link}>
                            {() => (
                              <Link
                                href={`/${link.toLowerCase().replace(' ', '-')}`}
                                className="block px-12 py-2 text-xs font-light tracking-[0.25em] hover:text-gray-500 transition-colors"
                                onClick={() => setIsMenuOpen(false)}
                                role="menuitem"
                              >
                                {link}
                              </Link>
                            )}
                          </Menu.Item>
                        ))}
                      </div>
                    </div>
                  </div>
                </Menu.Items>
              </Transition>

              {/* LAYER-TWO PANELS — 2D, NO left border; own right edge; start 1px to the right of the seam.
                 On tablet, fill the remaining viewport width to avoid right overflow. */}
              <Transition show={showDiscoverMenu} as={Fragment} enter="transition duration-100 ease-out" enterFrom="transform translate-x-[-100%]" enterTo="transform translate-x-0" leave="transition duration-75 ease-out" leaveFrom="transform translate-x-0" leaveTo="transform translate-x-[-100%]">
                <div
                  className={[
                    'fixed bottom-0 bg-white bg-clip-padding z-[1005] overflow-y-auto shadow-none',
                    TOP_DESKTOP, TOP_TABLET, LAYER_LEFT,
                    // tablet: take remaining space; desktop: keep fixed 400px
                    'tablet:w-[calc(100vw-401px)] desktop:w-[400px]',
                  ].join(' ')}
                  role="menu"
                  aria-label="Discover"
                >
                  <div className="absolute top-0 right-0 bottom-0 w-px bg-black" />
                  <div className="py-6">
                    {discoverLinks.map((link) => (
                      <Link key={link} href={to('discover', link)} className="block px-12 py-4 text-sm tracking-[0.25em] hover:text-gray-500 transition-colors" onClick={() => { setShowDiscoverMenu(false); setIsMenuOpen(false) }} role="menuitem">
                        {link}
                      </Link>
                    ))}
                  </div>
                </div>
              </Transition>

              <Transition show={showBrandsMenu} as={Fragment} enter="transition duration-100 ease-out" enterFrom="transform translate-x-[-100%]" enterTo="transform translate-x-0" leave="transition duration-75 ease-out" leaveFrom="transform translate-x-0" leaveTo="transform translate-x-[-100%]">
                <div className={['fixed bottom-0 bg-white bg-clip-padding z-[1005] overflow-y-auto shadow-none', TOP_DESKTOP, TOP_TABLET, LAYER_LEFT, 'tablet:w-[calc(100vw-401px)] desktop:w-[400px]'].join(' ')} role="menu" aria-label="Brands">
                  <div className="absolute top-0 right-0 bottom-0 w-px bg-black" />
                  <div className="py-6">
                    {brandLinks.map((link) => (
                      <Link key={link} href={to('brands', link)} className="block px-12 py-4 text-sm tracking-[0.25em] hover:text-gray-500 transition-colors" onClick={() => { setShowBrandsMenu(false); setIsMenuOpen(false) }} role="menuitem">
                        {link}
                      </Link>
                    ))}
                  </div>
                </div>
              </Transition>

              <Transition show={showCategoriesMenu} as={Fragment} enter="transition duration-100 ease-out" enterFrom="transform translate-x-[-100%]" enterTo="transform translate-x-0" leave="transition duration-75 ease-out" leaveFrom="transform translate-x-0" leaveTo="transform translate-x-[-100%]">
                <div className={['fixed bottom-0 bg-white bg-clip-padding z-[1005] overflow-y-auto shadow-none', TOP_DESKTOP, TOP_TABLET, LAYER_LEFT, 'tablet:w-[calc(100vw-401px)] desktop:w-[400px]'].join(' ')} role="menu" aria-label="Categories">
                  <div className="absolute top-0 right-0 bottom-0 w-px bg-black" />
                  <div className="py-6">
                    {(() => {
                      const catLower = category.toLowerCase()
                      const links = catLower === 'explore'
                        ? [...categoryLinksBase, ...exploreOnly]
                        : catLower === 'gifts'
                        ? giftsOnly
                        : categoryLinksBase
                      return links.map((link) => (
                        <Link key={link} href={to('categories', link)} className="block px-12 py-4 text-sm tracking-[0.25em] hover:text-gray-500 transition-colors" onClick={() => { setShowCategoriesMenu(false); setIsMenuOpen(false) }} role="menuitem">
                          {link}
                        </Link>
                      ))
                    })()}
                  </div>
                </div>
              </Transition>

              <Transition show={showDesignersMenu} as={Fragment} enter="transition duration-100 ease-out" enterFrom="transform translate-x-[-100%]" enterTo="transform translate-x-0" leave="transition duration-75 ease-out" leaveFrom="transform translate-x-0" leaveTo="transform translate-x-[-100%]">
                <div className={['fixed bottom-0 bg-white bg-clip-padding z-[1005] overflow-y-auto shadow-none', TOP_DESKTOP, TOP_TABLET, LAYER_LEFT, 'tablet:w-[calc(100vw-401px)] desktop:w-[400px]'].join(' ')} role="menu" aria-label="Designers">
                  <div className="absolute top-0 right-0 bottom-0 w-px bg-black" />
                  <div className="py-6">
                    {designerLinks.map((link) => (
                      <Link key={link} href={to('designers', link)} className="block px-12 py-4 text-sm tracking-[0.25em] hover:text-gray-500 transition-colors" onClick={() => { setShowDesignersMenu(false); setIsMenuOpen(false) }} role="menuitem">
                        {link}
                      </Link>
                    ))}
                  </div>
                </div>
              </Transition>

              <Transition show={showRankingsMenu} as={Fragment} enter="transition duration-100 ease-out" enterFrom="transform translate-x-[-100%]" enterTo="transform translate-x-0" leave="transition duration-75 ease-out" leaveFrom="transform translate-x-0" leaveTo="transform translate-x-[-100%]">
                <div className={['fixed bottom-0 bg-white bg-clip-padding z-[1005] overflow-y-auto shadow-none', TOP_DESKTOP, TOP_TABLET, LAYER_LEFT, 'tablet:w-[calc(100vw-401px)] desktop:w-[400px]'].join(' ')} role="menu" aria-label="Rankings">
                  <div className="absolute top-0 right-0 bottom-0 w-px bg-black" />
                  <div className="py-6">
                    {rankingLinks.map((link) => (
                      <Link key={link} href={to('rankings', link)} className="block px-12 py-4 text-sm tracking-[0.25em] hover:text-gray-500 transition-colors" onClick={() => { setShowRankingsMenu(false); setIsMenuOpen(false) }} role="menuitem">
                        {link}
                      </Link>
                    ))}
                  </div>
                </div>
              </Transition>
            </div>
          </>
        )
      }}
    </Menu>
  )
}

export default MegaMenu