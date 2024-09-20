(function ($) {
  $.fn.mauGallery = function (options) {
    var options = $.extend($.fn.mauGallery.defaults, options);
    var tagsCollection = [];

    return this.each(function () {
      $.fn.mauGallery.methods.createRowWrapper($(this));

      if (options.lightBox) {
        $.fn.mauGallery.methods.createLightBox(
          $(this),
          options.lightboxId,
          options.navigation
        );
      }

      $.fn.mauGallery.listeners(options);

      $(this)
        .children('.gallery-item')
        .each(function (index) {
          $.fn.mauGallery.methods.responsiveImageItem($(this));
          $.fn.mauGallery.methods.moveItemInRowWrapper($(this));
          $.fn.mauGallery.methods.wrapItemInColumn($(this), options.columns);

          // Ajout d'un attribut alt par défaut s'il est manquant
          var theTag = $(this).data('gallery-tag');
          if ($(this).is('img') && !$(this).attr('alt')) {
            $(this).attr('alt', 'Image related to ' + theTag);
          }

          if (
            options.showTags &&
            theTag !== undefined &&
            tagsCollection.indexOf(theTag) === -1
          ) {
            tagsCollection.push(theTag);
          }
        });

      if (options.showTags) {
        $.fn.mauGallery.methods.showItemTags(
          $(this),
          options.tagsPosition,
          tagsCollection
        );
      }

      // Lazy loading pour les performances SEO
      $(this)
        .find('img')
        .each(function () {
          $(this).attr('loading', 'lazy');
        });

      $(this).fadeIn(500);
    });
  };

  $.fn.mauGallery.defaults = {
    columns: 3,
    lightBox: true,
    lightboxId: null,
    showTags: true,
    tagsPosition: 'bottom',
    navigation: true,
  };

  $.fn.mauGallery.listeners = function (options) {
    $('.gallery-item').on('click', function () {
      if (options.lightBox && $(this).prop('tagName') === 'IMG') {
        $.fn.mauGallery.methods.openLightBox($(this), options.lightboxId);
      } else {
        return;
      }
    });

    $('.gallery').on('click', '.nav-link', $.fn.mauGallery.methods.filterByTag);
    $('.gallery').on('click', '.mg-prev', () =>
      $.fn.mauGallery.methods.prevImage(options.lightboxId)
    );
    $('.gallery').on('click', '.mg-next', () =>
      $.fn.mauGallery.methods.nextImage(options.lightboxId)
    );
  };

  $.fn.mauGallery.methods = {
    createRowWrapper(element) {
      if (!element.children().first().hasClass('row')) {
        element.append('<div class="gallery-items-row row"></div>');
      }
    },

    wrapItemInColumn(element, columns) {
      if (typeof columns === 'number') {
        element.wrap(
          `<div class='item-column mb-4 col-${Math.ceil(12 / columns)}'></div>`
        );
      } else if (typeof columns === 'object') {
        var columnClasses = '';
        if (columns.xs) columnClasses += ` col-${Math.ceil(12 / columns.xs)}`;
        if (columns.sm)
          columnClasses += ` col-sm-${Math.ceil(12 / columns.sm)}`;
        if (columns.md)
          columnClasses += ` col-md-${Math.ceil(12 / columns.md)}`;
        if (columns.lg)
          columnClasses += ` col-lg-${Math.ceil(12 / columns.lg)}`;
        if (columns.xl)
          columnClasses += ` col-xl-${Math.ceil(12 / columns.xl)}`;
        element.wrap(`<div class='item-column mb-4${columnClasses}'></div>`);
      } else {
        console.error(
          `Columns should be defined as numbers or objects. ${typeof columns} is not supported.`
        );
      }
    },

    moveItemInRowWrapper(element) {
      element.appendTo('.gallery-items-row');
    },

    responsiveImageItem(element) {
      if (element.prop('tagName') === 'IMG') {
        element.addClass('img-fluid');
      }
    },

    openLightBox(element, lightboxId) {
      $(`#${lightboxId}`)
        .find('.lightboxImage')
        .attr('src', element.attr('src'))
        .attr('alt', element.attr('alt')); // Ajouter l'alt à la lightbox
      $(`#${lightboxId}`).modal('toggle');
    },

    prevImage() {
      let activeImage = null;
      $('img.gallery-item').each(function () {
        if ($(this).attr('src') === $('.lightboxImage').attr('src')) {
          activeImage = $(this);
        }
      });

      let activeTag = $('.tags-bar span.active-tag').data('images-toggle');
      let imagesCollection = [];

      $('.item-column').each(function () {
        let img = $(this).children('img');
        if (activeTag === 'all' || img.data('gallery-tag') === activeTag) {
          imagesCollection.push(img);
        }
      });

      let index = imagesCollection.indexOf(activeImage) - 1;
      let prev =
        imagesCollection[index] ||
        imagesCollection[imagesCollection.length - 1];
      $('.lightboxImage')
        .attr('src', $(prev).attr('src'))
        .attr('alt', $(prev).attr('alt'));
    },

    nextImage() {
      let activeImage = null;
      $('img.gallery-item').each(function () {
        if ($(this).attr('src') === $('.lightboxImage').attr('src')) {
          activeImage = $(this);
        }
      });

      let activeTag = $('.tags-bar span.active-tag').data('images-toggle');
      let imagesCollection = [];

      $('.item-column').each(function () {
        let img = $(this).children('img');
        if (activeTag === 'all' || img.data('gallery-tag') === activeTag) {
          imagesCollection.push(img);
        }
      });

      let index = imagesCollection.indexOf(activeImage) + 1;
      let next = imagesCollection[index] || imagesCollection[0];
      $('.lightboxImage')
        .attr('src', $(next).attr('src'))
        .attr('alt', $(next).attr('alt'));
    },

    createLightBox(gallery, lightboxId, navigation) {
      gallery.append(`
        <div class="modal fade" id="${
          lightboxId || 'galleryLightbox'
        }" tabindex="-1" role="dialog" aria-hidden="true">
          <div class="modal-dialog" role="document">
            <div class="modal-content">
              <div class="modal-body">
                ${
                  navigation
                    ? '<div class="mg-prev" style="cursor:pointer;position:absolute;top:50%;left:-15px;background:white;">&lt;</div>'
                    : ''
                }
                <img class="lightboxImage img-fluid" alt="Contenu de l'image affichée dans la modale"/>
                ${
                  navigation
                    ? '<div class="mg-next" style="cursor:pointer;position:absolute;top:50%;right:-15px;background:white;">&gt;</div>'
                    : ''
                }
              </div>
            </div>
          </div>
        </div>
      `);
    },

    showItemTags(gallery, position, tags) {
      var tagItems =
        '<li class="nav-item"><span class="nav-link active active-tag" data-images-toggle="all">Tous</span></li>';
      $.each(tags, function (index, value) {
        tagItems += `<li class="nav-item"><span class="nav-link" data-images-toggle="${value}">${value}</span></li>`;
      });
      var tagsRow = `<ul class="my-4 tags-bar nav nav-pills">${tagItems}</ul>`;

      if (position === 'bottom') {
        gallery.append(tagsRow);
      } else if (position === 'top') {
        gallery.prepend(tagsRow);
      } else {
        console.error(`Unknown tags position: ${position}`);
      }
    },

    filterByTag() {
      if ($(this).hasClass('active-tag')) return;

      $('.active.active-tag').removeClass('active active-tag');
      $(this).addClass('active-tag active');

      var tag = $(this).data('images-toggle');
      $('.gallery-item').each(function () {
        let column = $(this).parents('.item-column');
        column.hide();
        if (tag === 'all' || $(this).data('gallery-tag') === tag) {
          column.show(300);
        }
      });
    },
  };
})(jQuery);
